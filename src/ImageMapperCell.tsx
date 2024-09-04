import ImageMapper, { Map } from "react-img-mapper";
import { useState, useRef, useEffect } from "react";
import { map } from "./localData/imageMapperData";
import { CellCheckBox, startUrl } from "./CellCheckBox";
import eyeImg from "./assets/eyecell-img.png";
import { v4 as uuidv4 } from "uuid";
import useResizeObserver from "./Resize";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
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

function ImageMapperCell(props: any) {
  const [windowSize, setWindowSize] = useState<{ [key: string]: any }>({});
  const [mapData, setMapData] = useState<{ [key: string]: any }>(map);
  const [cellData, setCellData] = useState<Array<any>>([]);
  const [image, setImage] = useState<any>();
  const [level, setLevel] = useState(0);
  const [submitData, setSubmitData] = useState<{ [key: string]: any }>({});
  const [imgCoords, setImgCoords] = useState("0");
  const [cellHoverArea, setCellHoverArea] = useState<{ [key: string]: any }>(
    []
  );
  const [ref, size] = useResizeObserver();
  const targetRef = useRef<HTMLDivElement>(null);
  function checkStateVals() {}
  const handleMouseEnter = (e: any) => {
    const rect = targetRef.current!.getBoundingClientRect();

    let dataIdxX = Math.floor(e.pageX - rect.left);
    let dataIdxY = Math.floor(e.pageY - (window.scrollY + rect.top - 1));

    setImgCoords(`${e.pageX}` + " " + `${e.pageY}`);
  };
  useEffect(() => {
    // console.log(windowWidth);
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
    // console.log(submitData);
    props.setHubReady(false);
    if (Object.keys(submitData).length < 1) {
      toast({
        title: "Please choose some datasets",
        description: (
          <p className="bg-red-500 text-white text-xl">
            Error, data selection is empty.
          </p>
        ),
      });
      return;
    }
    dataToHub(submitData);
    // let toastDisplay = Object.entries(submitData).map(([key]) => ({
    //   [key]: submitData[key].url,
    // }));
    // toast({
    //   title: "Submitted these cell data to the Epigenome Browser",
    //   description: (
    //     <pre className="mt-2 w-[635px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(toastDisplay, null, 1)}
    //       </code>
    //     </pre>
    //   ),
    // });
  }

  function dataToHub(data: { [key: string]: any }) {
    let hub: any[] = [];
    console.log(data);
    for (const [key, value] of Object.entries(data)) {
      // console.log(key);
      // console.log(value)

      for (const [folder, files] of Object.entries(value.url)) {
        console.log(folder, files);
        let type = ["hic_10K", "hic_25K", "hic_100K"].includes(folder)
          ? "hic"
          : "bigWig";
        let assay = folder.split("_")[0];
        if (folder === "mC_bw") {
          const fileArr = Array.isArray(files) ? files : [files];
          hub.push({
            name: `${key} CGN methylation`,
            url: startUrl + folder + "/" + fileArr[0],
            showOnHubLoad: true,
            type,
            metadata: {
              cell: key,
              assay: "CGN methylation",
            },
          });
          hub.push({
            name: `${key} CHN methylation`,
            url: startUrl + folder + "/" + fileArr[1],
            showOnHubLoad: true,
            type,
            metadata: {
              cell: key,
              assay: "CHN methylation",
            },
          });
        } else {
          hub.push({
            name: `${key} ${assay}`,
            url: startUrl + folder + "/" + files,
            type,
            showOnHubLoad: true,
            metadata: {
              cell: key,
              assay,
            },
          });
        }
      }
    }
    // console.log(hub)
    let hid = uuidv4();
    axios
      .post(
        "https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/",
        {
          _id: `${hid}`,
          hub: {
            content: hub,
          },
        }
      )
      .then((res) => {
        // console.log(res);
        props.setHubReady(true);
        props.setHubId(hid);
      })
      .catch((err) => {
        // console.error(err);
        toast({
          title: "Something error happened",
          description: (
            <p className="bg-red-500 text-white text-xl">
              API request fails, please contact site admin.
            </p>
          ),
        });
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
        let cardLevel = size.width / 290;
        let level = prevCellData.length / (cardLevel - 1);
        console.log(prevCellData.length / (cardLevel - 1), cardLevel);
        if (Math.floor(level) >= 1) {
          setLevel(Math.floor(level));
        }
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
    let cardLevel = size.width / 290;
    let level = cellData.length / (cardLevel - 1);

    if (Math.floor(level) >= 1) {
      setLevel(Math.floor(level));
    }
  }
  useEffect(() => {
    checkStateVals();
  }, [cellHoverArea]);
  useEffect(() => {
    let newkey = uuidv4();
    console.log("WUT", size);
    setImage(
      <ImageMapper
        key={newkey}
        src={eyeImg}
        width={size.width}
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
    );
    let cardLevel = size.width / 290;
    let level = cellData.length / (cardLevel - 1);

    if (Math.floor(level) >= 1) {
      setLevel(Math.floor(level));
    }
  }, [size]);
  return (
    <>
      <div
        ref={ref}
        style={{
          height: 1100 + 310 * level,
        }}
      >
        {image}

        <div>
          <Card className="flex flex-wrap max-w-[2560px] justify-center item-center min-h-[300px] ">
            <CardHeader>
              <CardTitle>Selected Cell types</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap flex-direction-[row] max-w-[2560px] justify-center item-center ">
              {cellData.map((item, index) => (
                <div className="w-[280px] " key={item.id}>
                  <Card
                    className={
                      cellHoverArea[item.name] === true
                        ? "w-[290px] bg-yellow-500"
                        : "w-[290px]"
                    }
                  >
                    <CrossCircledIcon
                      onClick={() => deleteCard(item)}
                      className="cursor-pointer text-black-500 hover:text-red-500"
                      style={{
                        position: "relative",
                        top: "10px",
                        left: "10px",
                      }}
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
              <Button onClick={() => handleSubmitToEg()}>Visualize</Button>
              {props.hubReady && (
                <p className="px-4">
                  Open the visualization in a new window,{" "}
                  <a
                    href={`https://epigenomegateway.wustl.edu/browser/?genome=hg38&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${props.hubId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    click here
                  </a>
                  .
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ImageMapperCell;
