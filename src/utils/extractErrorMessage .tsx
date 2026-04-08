// export const extractErrorMessage = (error: any): string => {
//     const data = error?.response?.data;

//     if (!data) return "Something went wrong";

//     if (data.errors) {

//         // Case: errors is array
//         if (Array.isArray(data.errors)) {
//             return data.errors[0];
//         }

//         // Case: errors is object
//         if (typeof data.errors === "object") {
//             const firstKey = Object.keys(data.errors)[0];
//             const value = data.errors[firstKey];

//             const message = Array.isArray(value) ? value[0] : value;

//             // Format key name properly
//             const formattedKey =
//                 firstKey.charAt(0).toUpperCase() +
//                 firstKey.slice(1).replace(/_/g, " ");

//             return `${formattedKey}: ${message}`;
//         }
//     }

//     return data.message || "Something went wrong";
// };

export const extractErrorMessage = (error: any): string => {
    const data = error?.response?.data;

    if (!data) return "Something went wrong";

    if (data.errors) {

        const getErrorWithKey = (errObj: any, parentKey = ""): any => {
            if (Array.isArray(errObj)) {
                return getErrorWithKey(errObj[0], parentKey);
            }

            if (typeof errObj === "object") {
                const firstKey = Object.keys(errObj)[0];
                return getErrorWithKey(errObj[firstKey], firstKey);
            }

            if (typeof errObj === "string") {
                return {
                    key: parentKey,
                    message: errObj
                };
            }

            return null;
        };

        const result = getErrorWithKey(data.errors);

        if (result) {
            const formattedKey =
                result.key.charAt(0).toUpperCase() +
                result.key.slice(1).replace(/_/g, " ");

            return `${formattedKey}: ${result.message}`;
        }
    }

    return data.message || "Something went wrong";
};