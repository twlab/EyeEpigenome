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
import { mouseURLs } from "./localData/eyeUrl";

function ImageMapperCell(props: any) {
  const [mapData, setMapData] = useState<{ [key: string]: any }>(map);
  const [cellData, setCellData] = useState<Array<any>>([]);
  const [mouseCellData, setMouseCellData] = useState<Array<any>>([]);
  const [submitData, setSubmitData] = useState<{ [key: string]: any }>({});
  const [imgCoords, setImgCoords] = useState("0");
  const [cellHoverArea, setCellHoverArea] = useState<{ [key: string]: any }>(
    []
  );
  const [ref, size] = useResizeObserver();
  const targetRef = useRef<HTMLDivElement>(null);
  // function checkStateVals() {}
  const handleMouseEnter = (e: any) => {
    // // this is for testing coordinates
    // const rect = targetRef.current!.getBoundingClientRect();
    // let dataIdxX = Math.floor(e.pageX - rect.left);
    // let dataIdxY = Math.floor(e.pageY - (window.scrollY + rect.top - 1));
    // setImgCoords(`${e.pageX}` + " " + `${e.pageY}`);
  };
  useEffect(() => {
    // console.log(windowWidth);
    if (targetRef.current) {
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
  function getData(selectedCellData: any) {
    if (selectedCellData.data.length > 0) {
      setSubmitData({
        ...submitData,
        [selectedCellData.cell.name]: {
          ...submitData[selectedCellData.cell.name],
          [selectedCellData.cell.type]: selectedCellData,
        },
      });
    } else {
      const copySubmitData = { ...submitData };
      if (
        copySubmitData[selectedCellData.cell.name] &&
        selectedCellData.cell.type in copySubmitData[selectedCellData.cell.name]
      ) {
        delete copySubmitData[selectedCellData.cell.name][
          selectedCellData.cell.type
        ];
        if (
          Object.keys(copySubmitData[selectedCellData.cell.name]).length === 0
        ) {
          delete copySubmitData[selectedCellData.cell.name];
        }
      }
      setSubmitData(copySubmitData);
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
 
    const formattedSubmitData: { [key: string]: any } = {};
    for (let key in submitData) {
      const cell = submitData[key];
      formattedSubmitData[`${key}`] = { url: {} };
      if (cell["human"]) {
        for (let cellKey in cell.human.url) {
          const url = cell.human.url[cellKey];
          formattedSubmitData[`${key}`].url[cellKey] = {type: "human", url};
        }
      }
      if (cell["mouse"]) {
        for (let cellMouseKey in cell.mouse.url) {
          const url = cell.mouse.url[cellMouseKey];
          if (
            formattedSubmitData[`${key}`].url &&
            cellMouseKey in formattedSubmitData[`${key}`].url
          ) {

            const humanUrl = formattedSubmitData[`${key}`].url[cellMouseKey];
            formattedSubmitData[`${key}`].url[cellMouseKey] = [
              humanUrl,
    
              { type: "mouse", url },
            ];
          } else {
            formattedSubmitData[`${key}`].url[cellMouseKey] = {type: "mouse", url};
          }
        }
      }
    }

    dataToHub(formattedSubmitData);
    // let toastDisplay = Object.entries(submitData).map(([key]) => ({
    //   [key]: submitData[key].url,
    // }));
    // toast({
    //   title: "Submitted these cell data to the Epigenome Browser",
    //   description: (
    //     <pre className="mtfor-2 w-[635px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(toastDisplay, null, 1)}
    //       </code>
    //     </pre>
    //   ),
    // });
  }

  const grouping: { [key: string]: any } = {
    RNA: 1,
    ATAC: 2,
  };

  function dataToHub(data: { [key: string]: any }) {

    const humanHub : any[] = []
    const mouseHub : any[] = []
    for (const [key, value] of Object.entries(data)) {
      // console.log(key);
      // console.log(value)

      for (const [folder, genomeData] of Object.entries(value.url)) {
        const files: {[key:string]: any} = genomeData as any
        let type = ["Hi-C: 10k", "Hi-C: 25k", "Hi-C: 100k"].includes(folder)
          ? "hic"
          : "bigWig";
        let assay = folder;
        if (folder === "Methylation") {
          const fileArr = Array.isArray(files.url) ? files.url : [files.url];
          humanHub.push({
            name: `${key} CGN methylation`,
            url: startUrl + fileArr[0],
            showOnHubLoad: true,
            type,
            metadata: {
              cell: key,
              assay: "CGN methylation",
            },
          });
          humanHub.push({
            name: `${key} CHN methylation`,
            url: startUrl + fileArr[1],
            showOnHubLoad: true,
            type,
            metadata: {
              cell: key,
              assay: "CHN methylation",
            },
          });
        } else {
          if (grouping.hasOwnProperty(assay)) {
            if (Array.isArray(files)) {
              for (let i = 0; i < files.length; i++) {
                const urlObj = files[i];
             
                const genomeType = urlObj.type;
                const trackHub ={
                        name: `${genomeType} ${key} ${assay}`,
                        url: startUrl + urlObj.url,
                        type,
                        showOnHubLoad: true,
                        options: {
                          group: grouping[assay],
                        },
                        metadata: {
                          cell: key,
                          assay,
                        },
                      };
           
                  if(urlObj.type === "human"){
         
                    humanHub.push(trackHub)
                  }
                  else{
                    mouseHub.push(trackHub)
                  }
          
              }
            } else {
              const trackHub = {
                name: `${key} ${assay}`,
                url: startUrl + files.url,
                type,
                showOnHubLoad: true,
                options: {
                  group: grouping[assay],
                },
                metadata: {
                  cell: key,
                  assay,
                },
              }
              if(files.type === "human"){
                humanHub.push(trackHub)
              }
              else{
                mouseHub.push(trackHub)
              }
            }
          } else {
            humanHub.push({
              name: `${key} ${assay}`,
              url: startUrl + files.url,
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
    }
    let hub
    if(mouseHub.length > 0){
      hub = [...humanHub, {
        name: "hg38tomm10",
        label: "Query mouse mm10 to hg38 blastz",
        type: "genomealign",
        showOnHubLoad: true,
        querygenome: "mm10",
        filetype: "genomealign",
        url: "https://vizhub.wustl.edu/public/hg38/weaver/hg38_mm10_axt.gz",
      }, ...mouseHub]
    }
    else{
      hub = [...humanHub, ...mouseHub]
    }
    console.log(hub)
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
    // setCellHoverArea((prevState) => ({
    //   ...prevState,
    //   [cell.name]: true,
    // }));

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
        const newCell = { ...cell };
        newCell["id"] = id;
        newCell["type"] = "human";
        return [...prevCellData, newCell];
      }
    });
    if (cell.name in mouseURLs.ATAC || cell.name in mouseURLs.RNA) {
      setMouseCellData((prevCellData) => {
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
          const newCell = { ...cell };
          newCell["id"] = id;
          newCell["type"] = "mouse";
          return [...prevCellData, newCell];
        }
      });
    }
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
    const copySubmitData = { ...submitData };

    // Updating the human and mouse data of the corresponding cell name in submitData
    if (cell.type === "human") {
      delete copySubmitData[cell.name]["human"];
      let newCellData = cellData.filter((item) => item.id !== cell.id);
      setCellData(newCellData);
    } else if (cell.type === "mouse") {
      delete copySubmitData[cell.name]["mouse"];
      let newMouseCellData = mouseCellData.filter(
        (item) => item.id !== cell.id
      );
      setMouseCellData(newMouseCellData);
    }

    if (!copySubmitData[cell.name].human && !copySubmitData[cell.name].mouse) {
      delete copySubmitData[cell.name];
    }
    // Updating the state with the new values
    setSubmitData(copySubmitData);
  }

  // useEffect(() => {
  //   console.log(submitData, "submitData");
  // }, [submitData]);

  return (
    <>
      <div ref={ref} style={{}}>
        <ImageMapper
          src={eyeImg}
          parentWidth={size.width}
          responsive={true}
          onImageClick={(e: any) => {
            setImgCoords("" + e.pageX + ", " + e.pageY);
          }}
          onMouseMove={(e) => {
            setImgCoords("" + e.active);
          }}
          onMouseLeave={(e) => handleHoverLeave(e)}
          onMouseEnter={(e) => handleHover(e)}
          onClick={(area: any) => handleImgClick(area)}
          lineWidth={3}
          map={mapData as Map}
        />
        <div>
          <Card className="flex flex-wrap max-w-[2560px] justify-center items-center min-h-[300px] bg-white shadow-lg rounded-lg p-4">
            <CardHeader className="w-full  text-center">
              <CardTitle className="text-2xl font-bold text-gray-700">
                Selected Cell Types
              </CardTitle>
            </CardHeader>

            <div className="flex w-full justify-between">
              {/* Human Data Section */}

              {cellData.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: mouseCellData.length === 0 ? "100%" : "50%",
                  }}
                >
                  <h2 className="text-xl font-semibold text-gray-600 text-center ">
                    Human
                  </h2>
                  {/* Separator Line */}
                  <div className="w-full border-t border-gray-300 my-3"></div>
                  <CardContent className="flex flex-wrap justify-center items-center">
                    {cellData.map((item, index) => (
                      <div className="w-[250px] " key={item.id}>
                        <Card
                          className={`w-[255px] border border-gray-300 shadow-md rounded-lg overflow-hidden ${
                            cellHoverArea[item.name]
                              ? "bg-yellow-500"
                              : "bg-white"
                          }`}
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
                            <CardTitle className="font-medium text-gray-800">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
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
                </div>
              ) : (
                ""
              )}
              {/* Vertical Separator */}
              <div className="border-r border-gray-300"></div>

              {/* Mouse Data Section */}
              {mouseCellData.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: cellData.length === 0 ? "100%" : "50%",
                  }}
                >
                  <h2 className="text-xl font-semibold text-gray-600 text-center">
                    Mouse
                  </h2>
                  {/* Separator Line */}
                  <div className="w-full border-t border-gray-300 my-3"></div>
                  <CardContent className="flex flex-wrap justify-center items-center">
                    {mouseCellData.map((item, index) => (
                      <div className="w-[250px] " key={item.id}>
                        <Card
                          className={`w-[255px] border border-gray-300 shadow-md rounded-lg overflow-hidden ${
                            cellHoverArea[item.name]
                              ? "bg-yellow-500"
                              : "bg-white"
                          }`}
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
                            <CardTitle className="font-medium text-gray-800">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
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
                </div>
              ) : (
                ""
              )}
            </div>

            <CardFooter className="w-full mt-6 text-center justify-center">
              <Button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => handleSubmitToEg()}
              >
                Visualize
              </Button>
              {props.hubReady && (
                <p className="px-4 mt-2 text-gray-600">
                  Open the visualization in a new window,{" "}
                  <a
                    className="text-blue-500 underline hover:text-blue-700"
                    href={`https://epigenomegateway.wustl.edu/browser2022/?genome=hg38&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${props.hubId}`}
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