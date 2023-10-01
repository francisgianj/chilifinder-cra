import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import ImagePredict from "../components/ImagePredict";
import { useEffect } from "react";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    switch (pathname) {
      case "/":
        document.title =
          "ChiliFinder | Automatic Chili Pepper Plant Species Identification using Convolutional Neural Networks";
        break;
      case "/about":
        document.title = "About | ChiliFinder";
        break;
      case "/the-researchers":
        document.title = "The Researchers | ChiliFinder";
        break;
      default:
        document.title =
          "ChiliFinder | Automatic Chili Pepper Plant Species Identification using Convolutional Neural Networks";
        break;
    }
  }, [pathname]);

  return (
    <div>
      <Header />
      {pathname === "/" ? (
        <div className="mt-12 mb-8">
          <div className="max-w-3xl mx-auto px-4 md:px-0">
            <h1 className="mb-4 text-xl md:text-3xl font-bold">
              Chili Predict
            </h1>
            <div className="space-y-2">
              <p className="text-sm md:text-base">
                Perform image prediction directly in the browser using a
                pre-trained CNN MobileNet model to recognize{" "}
                <span className="text-red-500">Bell Pepper</span>,{" "}
                <span className="text-red-500">Jalapeño</span>,{" "}
                <span className="text-red-500">Long Chili</span>,{" "}
                <span className="text-red-500">Pimiento Pepper</span>,{" "}
                <span className="text-red-500">Siling Labuyo</span>, and{" "}
                <span className="text-red-500">Thai Chili</span>. This approach
                ensures that the{" "}
                <span className="italic">
                  image stays local and is not uploaded to any external servers
                </span>
                .
              </p>
              <ImagePredict />
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}

export default App;
