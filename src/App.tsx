import { useState } from "react";
import "./App.css";
import ImageMapperCell from "./ImageMapperCell";
import BrowserFrame from "./BrowserFrame";

function App() {
  const [hubId, setHubId] = useState(null);
  const [hubReady, setHubReady] = useState(false);

  return (
    <>
      <div className="bg-orange-500">
        <h1 className="text-4xl font-bold py-8 text-white px-4">
          Epigenomics in the Eye
        </h1>
      </div>

      <p className="px-4">
        Click the colored text labels to choose cell types, then choose the
        assay types from the selection below.
      </p>
      <div className="items-center justify-center">
        <ImageMapperCell
          hubId={hubId}
          hubReady={hubReady}
          setHubReady={setHubReady}
          setHubId={setHubId}
        />
      </div>
      <div>{hubReady && <BrowserFrame hubId={hubId} />}</div>
      <div className="inline-flex items-center justify-center w-full">
        <hr className=" w-32 h-1  bg-gray-200 border-0 rounded dark:bg-gray-700" />
        <div
          className="py-2"
          style={{ display: "flex", justifyContent: "center" }}
        >
          Site created by{" "}
          <a
            href="http://ayyagarilab.ucsd.edu/"
            target="_blank"
            rel="noreferrer"
          >
            Radha Ayyagari lab
          </a>{" "}, 
          <a
            href="http://renlab.sdsc.edu/renlab_website/"
            target="_blank"
            rel="noreferrer"
          >
            Bing Ren Lab
          </a>{" "}
          and{" "}
          <a href="http://wang.wustl.edu/" target="_blank" rel="noreferrer">
            Ting Wang Lab
          </a>
        </div>
        <hr className=" w-32 h-1 my-8 bg-gray-200 border-0 rounded dark:bg-gray-700" />
      </div>
    </>
  );
}

export default App;
