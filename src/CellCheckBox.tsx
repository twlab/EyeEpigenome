"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { URLs } from "./localData/eyeUrl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useEffect, useState } from "react";
const startUrl = "https://epigenome.wustl.edu/EyeEpigenome/data/";
const items = [
  {
    id: "ATAC_bw",
    label: "ATAC_bw",
  },
  {
    id: "RNA_bw",
    label: "RNA_bw",
  },
  {
    id: "hic",
    label: "hic",
  },
  {
    id: "mC_bw",
    label: "mC_bw",
  },
] as const;

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export function CellCheckBox(props: any) {
  const [dataChoice, setDataChoice] = useState<Array<any>>([]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    let urlObj: { [key: string]: any } = {};
    {
      for (const dataType of dataChoice) {
        urlObj[dataType] =
          startUrl + dataType + "/" + URLs[dataType][props.cell.name];
      }
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
              {items.map((item) => (
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
                                ? setDataChoice([...field.value, item.id])
                                : setDataChoice(
                                    field.value?.filter(
                                      (value) => value !== item.id
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
