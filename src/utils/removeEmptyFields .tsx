// export const  removeEmptyFields = (obj: any) => {
//   return Object.fromEntries(
//     Object.entries(obj).filter(
//       ([_, value]) => value !== "" && value !== null && value !== undefined
//     )
//   );
// };

// export const removeEmptyFields = (obj: any): any => {
//   if (Array.isArray(obj)) {
//     return obj
//       .map(removeEmptyFields)
//       .filter(
//         (item) =>
//           item !== null &&
//           item !== undefined &&
//           (typeof item !== "object" || Object.keys(item).length > 0)
//       );
//   }

//   if (typeof obj === "object" && obj !== null) {
//     return Object.fromEntries(
//       Object.entries(obj)
//         .map(([key, value]) => [key, removeEmptyFields(value)])
//         .filter(
//           ([_, value]) =>
//             value !== "" &&
//             value !== null &&
//             value !== undefined &&
//             !(typeof value === "object" && Object.keys(value).length === 0)
//         )
//     );
//   }

//   return obj;
// };

export const removeEmptyFields = (obj: any): any => {
  // Array-ah irundha loop panni empty items-a remove pannum
  if (Array.isArray(obj)) {
    return obj
      .map(removeEmptyFields)
      .filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== "" && // Empty strings in array-um remove aagum
          (typeof item !== "object" || Object.keys(item).length > 0)
      );
  }

  // Object-ah irundha keys-a check pannum
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, removeEmptyFields(value)])
        .filter(
          ([_, value]) =>
            value !== "" && // Remove empty strings
            value !== null && // Remove nulls
            value !== undefined && // Remove undefined
            // Optional: User blank spaces mattum pottu vachirundha remove panna:
            // (typeof value !== 'string' || value.trim() !== "") && 
            !(typeof value === "object" && Object.keys(value).length === 0) // Remove empty objects/arrays
        )
    );
  }

  return obj;
};