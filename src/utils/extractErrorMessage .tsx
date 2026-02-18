export const extractErrorMessage = (error: any): string => {
    const data = error?.response?.data;

    if (!data) return "Something went wrong";

    if (data.errors) {

        // Case: errors is array
        if (Array.isArray(data.errors)) {
            return data.errors[0];
        }

        // Case: errors is object
        if (typeof data.errors === "object") {
            const firstKey = Object.keys(data.errors)[0];
            const value = data.errors[firstKey];

            const message = Array.isArray(value) ? value[0] : value;

            // Format key name properly
            const formattedKey =
                firstKey.charAt(0).toUpperCase() +
                firstKey.slice(1).replace(/_/g, " ");

            return `${formattedKey}: ${message}`;
        }
    }

    return data.message || "Something went wrong";
};
