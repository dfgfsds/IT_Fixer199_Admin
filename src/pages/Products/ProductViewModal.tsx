import { } from "react";


const ProductViewModal = ({ show, onClose, product }: any) => {
    if (!show || !product) return null;

    // Parse specifications
    let parsedSpecs: any[] = [];
    if (product.specification) {
        try {
            const specData = typeof product.specification === "string"
                ? JSON.parse(product.specification)
                : product.specification;

            if (Array.isArray(specData)) {
                parsedSpecs = specData.map((item: any) => {
                    const key = Object.keys(item)[0];
                    return { key, value: item[key] };
                });
            } else if (typeof specData === "object") {
                parsedSpecs = Object.entries(specData).map(([key, value]) => ({ key, value }));
            }
        } catch (e) {
            console.error("Error parsing specs", e);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER - Exact match to OrderDetailsTabsModal */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Product Details</h2>
                        <p className="text-xs text-gray-500">Order ID: {product.sku || "N/A"}</p>
                    </div>
                    <button onClick={onClose} className="text-xl p-2 hover:bg-gray-100 rounded-full transition leading-none">×</button>
                </div>

                {/* TABS - Exact match to OrderDetailsTabsModal */}
                <div className="flex border-b px-4">
                    <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-orange-600 text-orange-600">
                        Product Details
                    </button>
                </div>

                {/* CONTENT - Exact match to OrderDetailsTabsModal structure */}
                <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">

                    {/* PRODUCT INFO - orange-tinted section */}
                    <section className="bg-orange-50/40 border border-orange-100 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-orange-600 mb-5">
                            Product Information
                        </h3>

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <Info label="Name" value={product.name} />
                            <Info label="Model" value={product.model_name || "-"} />
                            <Info label="Brand" value={product.brand_details?.name || "-"} />
                            <Info label="Status" value={product.status} />
                            <div className="col-span-2 text-gray-700">
                                <Info label="Description" value={product.description || "-"} />
                            </div>
                        </div>
                    </section>

                    {/* MEDIA SECTION */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-5">
                            Product Media
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {product.media?.map((m: any, i: number) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                                    <img src={m.url} alt="product" className="w-32 h-32 object-cover rounded-lg" />
                                </div>
                            ))}
                            {(!product.media || product.media.length === 0) && (
                                <p className="text-sm text-gray-400">No images available</p>
                            )}
                        </div>
                    </section>

                    {/* ATTRIBUTES & CATEGORIES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-5">Categories</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {product.categories?.map((cat: any) => (
                                    <span key={cat.id} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-blue-700 font-medium">{cat.name}</span>
                                ))}
                            </div>
                        </section>

                        <section className="bg-green-50 border border-green-100 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-green-600 mb-5">Attributes</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {product.attributes_details?.map((attr: any, i: number) => (
                                    <Info key={i} label={attr.attribute_name} value={attr.value} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* PRICING summary blocks */}
                    <section className="bg-gray-900 text-white rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-5">Pricing Summary</h3>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-10">
                                {product.product_pricing?.map((price: any, i: number) => (
                                    <div key={i}>
                                        <span className="text-gray-400 block text-xs uppercase mb-1">{price.type}</span>
                                        <span className="text-xl font-bold text-orange-400">₹{price.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SPECIFICATIONS */}
                    {parsedSpecs.length > 0 && (
                        <section className="bg-white border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-5">Full Specifications</h3>
                            <div className="grid grid-cols-2 gap-6 border-t pt-4">
                                {parsedSpecs.map((spec, i) => (
                                    <Info key={i} label={spec.key} value={spec.value} />
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* FOOTER */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

// Internal Info component matching OrderViewModal
const Info = ({ label, value }: any) => (
    <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {label}
        </p>
        <p className="text-gray-800 font-medium">
            {value || "-"}
        </p>
    </div>
);

export default ProductViewModal;
