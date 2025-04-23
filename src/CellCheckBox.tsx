"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { mouseURLs, URLs } from "./localData/eyeUrl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useEffect, useState } from "react";
export const startUrl = "https://epigenome.wustl.edu/EyeEpigenome/data/";
const items = [
  {
    id: "ATAC_50bs",
    label: "ATAC",
  },
  {
    id: "RNA_50bs",
    label: "RNA",
  },
  {
    id: "hic_10K",
    label: "Hi-C: 10k",
  },
  {
    id: "hic_25K",
    label: "Hi-C: 25k",
  },
  {
    id: "hic_100K",
    label: "Hi-C: 100k",
  },
  {
    id: "mC_bw",
    label: "Methylation",
  },
] as const;
const mouseItems = [
  {
    id: "ATAC",
    label: "ATAC",
  },
  {
    id: "RNA",
    label: "RNA",
  },
] as const;
const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export function CellCheckBox(props: any) {
  const [dataChoice, setDataChoice] = useState<Array<any>>([]);
  const itemsType = props.cell.type === "human" ? items : mouseItems;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    let urlObj: { [key: string]: any } = {};
    const URLsType = props.cell.type === "human" ? URLs : mouseURLs;
    const folder = props.cell.type === "human" ? "" : "mouse/";

    for (const dataType of dataChoice) {
      let dataUrls;
      if (dataType.id === "mC_bw") {
        dataUrls = [...URLsType[dataType.id][props.cell.name]];
        dataUrls[0] = "mC_bw/" + dataUrls[0];
        dataUrls[1] = "mC_bw/" + dataUrls[1];
      } else {
        dataUrls =
          `${folder}` +
          `${dataType.id}` +
          "/" +
          `${URLsType[dataType.id][props.cell.name]}`;
      }
      urlObj[dataType.label] = dataUrls;
    }

    props.getData({
      cell: props.cell,
      data: dataChoice,
      url: urlObj,
    });
  }, [dataChoice]);
  return (
    <Form {...form}>
      <div className="space-y-8">
        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              {itemsType.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="items"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              checked
                                ? setDataChoice([...dataChoice, item])
                                : setDataChoice(
                                    dataChoice?.filter(
                                      (value) => value.id !== item.id
                                    )
                                  );
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
