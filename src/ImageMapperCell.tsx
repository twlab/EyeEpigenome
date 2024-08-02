import ImageMapper, { Map } from "react-img-mapper";
import { useState, useRef, useEffect } from "react";
import { map } from "./localData/imageMapperData";
import { CellCheckBox } from "./CellCheckBox";
import eyeImg from "./assets/eyecell-img.png";
import { v4 as uuidv4 } from "uuid";
import { CrossCircledIcon } from "@radix-ui/react-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { toast } from "./components/ui/use-toast";
const windowWidth = window.innerWidth;

function ImageMapperCell(props: any) {
  const [windowSize, setWindowSize] = useState(windowWidth);
  const [mapData, setMapData] = useState<{ [key: string]: any }>(map);
  const [cellData, setCellData] = useState<Array<any>>([]);
  const [submitData, setSubmitData] = useState<{ [key: string]: any }>({});
  const [imgCoords, setImgCoords] = useState("0");
  const [cellHoverArea, setCellHoverArea] = useState<{ [key: string]: any }>(
    []
  );

  const targetRef = useRef<HTMLDivElement>(null);
  function checkStateVals() {}
  const handleMouseEnter = (e: any) => {
    const rect = targetRef.current!.getBoundingClientRect();

    let dataIdxX = Math.floor(e.pageX - rect.left);
    let dataIdxY = Math.floor(e.pageY - (window.scrollY + rect.top - 1));

    setImgCoords(`${e.pageX}` + " " + `${e.pageY}`);
  };
  useEffect(() => {
    console.log(windowWidth);
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();

      let tempObj = { ...mapData };
      let tempMapArea = [...mapData.areas];

      for (let i = 0; i < tempMapArea.length; i++) {
        let [topleftX, topleftY, bottomrightX, bottomrightY] =
          tempMapArea[i].coords;

        tempMapArea[i].coords = new Array<any>(
          topleftX,
          topleftY,
          bottomrightX,
          bottomrightY
        );
      }
      targetRef.current.addEventListener("mousemove", handleMouseEnter);
      tempObj.areas = tempMapArea;

      setMapData({ ...tempObj });
    }
    return () => {
      if (targetRef.current !== null) {
        targetRef.current.removeEventListener("mousemove", handleMouseEnter);
      }
    };
  }, []);
  function getData(cellData: any) {
    if (cellData.data.length > 0) {
      setSubmitData({ ...submitData, [cellData.cell.name]: cellData });
    } else {
      let tempSubmitData = Object.fromEntries(
        Object.entries(submitData).filter(
          ([key]) => submitData[key].cell.id !== cellData.cell.id
        )
      );
      setSubmitData({ ...tempSubmitData });
    }
  }
  function handleSubmitToEg() {
    console.log(submitData);
    let toastDisplay = Object.entries(submitData).map(([key]) => ({
      [key]: submitData[key].url,
    }));
    toast({
      title: "Submitted these cell data to the Epigenome Browser",
      description: (
        <pre className="mt-2 w-[635px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(toastDisplay, null, 1)}
          </code>
        </pre>
      ),
    });
  }
  function handleImgClick(cell: any) {
    setCellHoverArea((prevState) => ({
      ...prevState,
      [cell.name]: true,
    }));

    setCellData((prevCellData) => {
      let dupe = false;
      for (let i = 0; i < prevCellData.length; i++) {
        if (cell.name === prevCellData[i].name) {
          dupe = true;
        }
      }
      if (dupe) {
        return prevCellData;
      } else {
        let id = uuidv4();
        cell["id"] = id;
        return [...prevCellData, cell];
      }
    });
  }
  function handleHoverLeave(cell: any) {
    setCellHoverArea((prevState) => ({
      ...prevState,
      [cell.name]: false,
    }));
  }
  function handleHover(cell: any) {
    setCellHoverArea((prevState) => ({
      ...prevState,
      [cell.name]: true,
    }));
  }
  function deleteCard(cell: any) {
    let tempCellData = cellData.filter((item, index) => {
      return item.id !== cell.id;
    });
    let tempSubmitData = Object.fromEntries(
      Object.entries(submitData).filter(
        ([key]) => submitData[key].cell.id !== cell.id
      )
    );
    setSubmitData({ ...tempSubmitData });
    setCellData([...tempCellData]);
  }
  useEffect(() => {
    checkStateVals();
  }, [cellHoverArea]);
  // coordinate are scales to 700px
  return (
    <>
      <div ref={targetRef}>
        <ImageMapper
          src={eyeImg}
          width={1400}
          imgWidth={1508}
          onImageClick={(e: any) => {
            setImgCoords("" + e.pageX + ", " + e.pageY);
          }}
          onMouseMove={(e) => {
            setImgCoords("" + e.active);
          }}
          onMouseLeave={(e) => handleHoverLeave(e)}
          onMouseEnter={(e) => handleHover(e)}
          onClick={(area: any) => handleImgClick(area)}
          map={mapData as Map}
        />
        <div>{imgCoords}</div>
      </div>
      <Card className="w-[1400px] flex flex-wrap max-w-[2560px] justify-center item-center min-h-[375px] ">
        <CardHeader>
          <CardTitle> Selected Cells</CardTitle>
        </CardHeader>
        <CardContent className="w-[1400px] flex flex-wrap flex-direction-[row] max-w-[2560px] justify-center item-center ">
          {cellData.map((item, index) => (
            <div className="w-[280px] " key={item.id}>
              <Card
                className={
                  cellHoverArea[item.name] === true
                    ? "w-[300px] bg-blue-500"
                    : "w-[300px]"
                }
              >
                <CrossCircledIcon
                  onClick={() => deleteCard(item)}
                  className="cursor-pointer text-black-500 hover:text-red-500"
                  style={{ position: "relative", top: "10px", left: "10px" }}
                />
                <CardHeader>
                  <div className="space-y-8"></div>
                  <CardTitle> {item.name}</CardTitle>
                  <CardDescription>
                    Select the data you want to display
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <CellCheckBox cell={item} getData={getData} />
                </CardContent>
              </Card>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSubmitToEg()}>Submit</Button>
        </CardFooter>
      </Card>
    </>
  );
}

export default ImageMapperCell;
