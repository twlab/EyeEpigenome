import { useState } from "react";
import "./App.css";
import ImageMapperCell from "./ImageMapperCell";
import BrowserFrame from "./BrowserFrame";

function App() {
  const [hubId, setHubId] = useState(null);
  const [hubReady, setHubReady] = useState(false);

  return (
    <>
      <div className="bg-orange-600">
        <div className="max-w-8xl mx-auto flex items-center justify-between py-5 px-4">
          <h1 className="text-4xl font-bold text-white">Epigenomics in the Eye</h1>

          <a
            href="https://epigenome.wustl.edu/EyeEpigenome/data/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-100 font-medium hover:underline underline-offset-2 transition transform hover:scale-105 hover:brightness-110 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              focusable="false"
            >
              <title>Open external link</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14L21 3" />
            </svg>
            <span>Access and Download Data</span>
          </a>
        </div>
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
