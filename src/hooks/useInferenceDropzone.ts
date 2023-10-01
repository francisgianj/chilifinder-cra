import { useCallback, useState } from "react";
import preprocessImage from "../utils/preprocess-image";
import loadImage from "../utils/load-image";
import { atom, useAtom } from "jotai";
import * as tf from "@tensorflow/tfjs";
import { loadable } from "jotai/utils";

enum Label {
  BELL_PEPPER = "Bell Pepper",
  JALAPENO = "Jalapeño",
  LONG_CHILI = "Long Chili",
  PIMIENTO_PEPPER = "Pimiento Pepper",
  SILING_LABUYO = "Siling Labuyo",
  THAI_CHILI = "Thai Chili",
}

const LABEL_MAPPER: { [n: number]: Label } = {
  0: Label.BELL_PEPPER,
  1: Label.JALAPENO,
  2: Label.LONG_CHILI,
  3: Label.PIMIENTO_PEPPER,
  4: Label.SILING_LABUYO,
  5: Label.THAI_CHILI,
};

interface Result {
  label?: string;
  isProcessing?: boolean;
  timeInference?: number;
  probability?: number;
  imageFile: File;
  imageUrl: string;
}

const asyncModelAtom = atom(async () => {
  const timeLoadModel = performance.now();
  const model = await tf.loadLayersModel("/static/model-tfjs/model.json");

  return {
    model,
    timeLoadModel: performance.now() - timeLoadModel,
  };
});

const loadableModelAtom = loadable(asyncModelAtom);

export const resultsAtom = atom<Result[]>([]);

// ... (imports and enums)

export default function useInferenceDropzone() {
  const [modelAtom] = useAtom(loadableModelAtom);
  const [results, setResults] = useAtom(resultsAtom);
  const [isInferenceInProgress, setIsInferenceInProgress] = useState(false);

  const isModelLoading =
    modelAtom.state === "loading" || modelAtom.state !== "hasData";

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isModelLoading || !acceptedFiles?.length || isInferenceInProgress)
        return;

      setIsInferenceInProgress(true);

      const image = acceptedFiles[0];

      try {
        const start = performance.now();

        const img = await loadImage(image);
        const processedImg = await preprocessImage(img);

        if (!modelAtom?.data || !processedImg) return;

        const model = modelAtom.data.model;
        const prediction = model.predict(processedImg) as tf.Tensor<tf.Rank>;
        const predictedClassIndex = tf.argMax(prediction, -1).dataSync()[0];
        const timeInference = performance.now() - start;

        const newResult: Result = {
          isProcessing: false,
          imageFile: image,
          imageUrl: URL.createObjectURL(image),
          label: LABEL_MAPPER[predictedClassIndex],
          probability: prediction.dataSync()[predictedClassIndex],
          timeInference,
        };

        setResults([newResult, ...results]);
      } catch (error) {
        console.error("Error during inference:", error);
      } finally {
        setIsInferenceInProgress(false);
      }
    },
    [isModelLoading, modelAtom, setResults, results, isInferenceInProgress]
  );

  return {
    isModelLoading,
    modelAtom: isModelLoading ? null : modelAtom.data,
    onDrop,
  };
}
