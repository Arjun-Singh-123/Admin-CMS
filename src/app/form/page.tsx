import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";

type FieldType = "text" | "textarea" | "image" | "links";

interface FooterField {
  type: FieldType;
  label: string;
  value: string | { text: string; url: string }[];
}

interface FooterContent {
  id?: string;
  content: Record<string, FooterField>;
}

const MyForm = () => {
  const { control, handleSubmit, setValue, watch } = useForm<FooterContent>({
    defaultValues: {
      content: {},
    },
  });

  // Convert content object to array format for useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contentArray", // We'll manage an array representation
  });

  // To update the content object when using useFieldArray
  const updateContentObject = (fieldsArray) => {
    const updatedContent = {};
    fieldsArray.forEach((field) => {
      updatedContent[field.id] = {
        type: field.type,
        label: field.label,
        value: field.value,
      };
    });
    setValue("content", updatedContent); // Update the original content object
  };

  // Add a new field with a unique ID
  const addField = (type: FieldType) => {
    const uniqueId = `field-${Date.now()}`;
    append({
      id: uniqueId,
      type,
      label: "",
      value: type === "links" ? [] : "",
    });
  };

  // Handle form submission
  const onSubmit = (data: FooterContent) => {
    console.log(data);
  };

  // Watch fields array changes to update the content object accordingly
  watch((value) => {
    updateContentObject(value.contentArray);
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <Controller
              name={`contentArray.${index}.label`}
              control={control}
              render={({ field: labelField }) => (
                <input
                  {...labelField}
                  placeholder="Field Label"
                  className="input"
                />
              )}
            />
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>

          <Controller
            name={`contentArray.${index}.value`}
            control={control}
            render={({ field: valueField }) => {
              switch (field.type) {
                case "text":
                  return (
                    <input
                      {...valueField}
                      placeholder="Text Value"
                      className="input"
                    />
                  );
                case "textarea":
                  return (
                    <textarea
                      {...valueField}
                      placeholder="Textarea Value"
                      className="input"
                    />
                  );
                case "image":
                  return (
                    <input
                      type="file"
                      onChange={(e) => {
                        /* handle image upload */
                      }}
                    />
                  );
                case "links":
                  return (
                    <div>
                      {(
                        valueField.value as { text: string; url: string }[]
                      ).map((link, linkIndex) => (
                        <div key={linkIndex} className="flex space-x-2">
                          <input
                            {...register(
                              `contentArray.${index}.value.${linkIndex}.text` as const
                            )}
                            placeholder="Link Text"
                          />
                          <input
                            {...register(
                              `contentArray.${index}.value.${linkIndex}.url` as const
                            )}
                            placeholder="Link URL"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentLinks = watch(
                                `contentArray.${index}.value`
                              ) as { text: string; url: string }[];
                              setValue(
                                `contentArray.${index}.value`,
                                currentLinks.filter((_, i) => i !== linkIndex)
                              );
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const currentLinks = watch(
                            `contentArray.${index}.value`
                          ) as { text: string; url: string }[];
                          setValue(`contentArray.${index}.value`, [
                            ...currentLinks,
                            { text: "", url: "" },
                          ]);
                        }}
                      >
                        Add Link
                      </button>
                    </div>
                  );
                default:
                  return null;
              }
            }}
          />
        </div>
      ))}
      <button type="button" onClick={() => addField("text")}>
        Add Text Field
      </button>
      <button type="button" onClick={() => addField("links")}>
        Add Links Field
      </button>
      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
