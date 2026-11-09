import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createAdminProduct,
  deleteAdminProduct,
  loginAdmin,
  logoutAdmin,
  updateAdminProduct,
} from "../services/adminApi";
import type { AppDispatch, RootState } from "../store/store";
import { fetchProducts } from "../store/productsSlice";
import type { Product } from "../types/product";
import { formatPrice } from "../utils/formatNumber";

const sessionStorageKey = "famina-admin-token";
const materials: Product["material"][] = [
  "ابریشم",
  "نخی",
  "وال اسلپ",
  "ژاکارد",
];
const maxImageCount = 4;
const maxImageSize = 5 * 1024 * 1024;
const maxTotalImageSize = 10 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("خواندن یکی از تصاویر انجام نشد."));
    reader.onerror = () => reject(new Error("خواندن یکی از تصاویر انجام نشد."));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state: RootState) => state.products);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [token, setToken] = useState(
    () => window.sessionStorage.getItem(sessionStorageKey) ?? "",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState<Product["material"]>(materials[0]);
  const [rating, setRating] = useState("0");
  const [reviewCount, setReviewCount] = useState("0");
  const [availability, setAvailability] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (token) {
      dispatch(fetchProducts());
    }
  }, [dispatch, token]);

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const adminToken = await loginAdmin(username, password);
      window.sessionStorage.setItem(sessionStorageKey, adminToken);
      setToken(adminToken);
      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "ورود مدیر انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedImages = Array.from(event.target.files ?? []);
    setImages(selectedImages);
    setError("");

    if (selectedImages.length > maxImageCount) {
      setError("برای هر محصول حداکثر ۴ تصویر انتخاب کنید.");
      return;
    }

    if (
      selectedImages.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > maxImageSize,
      )
    ) {
      setError(
        "تصاویر باید JPEG، PNG یا WebP و هرکدام حداکثر ۵ مگابایت باشند.",
      );
      return;
    }

    if (
      selectedImages.reduce((sum, file) => sum + file.size, 0) >
      maxTotalImageSize
    ) {
      setError("حجم کل تصاویر نمی‌تواند بیشتر از ۱۰ مگابایت باشد.");
    }
  }

  function resetProductForm() {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setMaterial(materials[0]);
    setRating("0");
    setReviewCount("0");
    setAvailability(true);
    setImages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function startEditingProduct(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setMaterial(product.material);
    setRating(String(product.rating));
    setReviewCount(String(product.reviewCount));
    setAvailability(product.availability);
    setImages([]);
    setError("");
    setNotice("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    document.getElementById("product-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleProductSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!editingProduct && images.length === 0) {
      setError("حداقل یک و حداکثر ۴ تصویر انتخاب کنید.");
      return;
    }

    if (images.length > maxImageCount) {
      setError("حداکثر ۴ تصویر برای محصول انتخاب کنید.");
      return;
    }

    if (
      images.length > 0 &&
      (images.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > maxImageSize,
      ) ||
        images.reduce((sum, file) => sum + file.size, 0) > maxTotalImageSize)
    ) {
      setError("حجم یا قالب تصاویر انتخاب‌شده معتبر نیست.");
      return;
    }

    setBusy(true);

    try {
      const productFields = {
        name: name.trim(),
        price: Number(price),
        material,
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        availability,
      };
      const imageGallery = images.length
        ? await Promise.all(
            images.map(async (file, index) => ({
              label: `تصویر محصول ${index + 1}`,
              dataUrl: await fileToDataUrl(file),
            })),
          )
        : undefined;

      if (editingProduct) {
        await updateAdminProduct(token, editingProduct.id, {
          ...productFields,
          ...(imageGallery ? { imageGallery } : {}),
        });
        setNotice(`تغییرات محصول «${productFields.name}» ذخیره شد.`);
      } else {
        const createdProduct = await createAdminProduct(token, {
          ...productFields,
          imageGallery: imageGallery ?? [],
        });
        setNotice(`محصول «${createdProduct.name}» ثبت شد.`);
      }

      dispatch(fetchProducts());
      resetProductForm();
    } catch (saveError) {
      handleAdminRequestError(saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : editingProduct
            ? "ویرایش محصول انجام نشد."
            : "ثبت محصول انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleAdminRequestError(requestError: unknown) {
    if (
      typeof requestError === "object" &&
      requestError !== null &&
      "status" in requestError &&
      requestError.status === 401
    ) {
      window.sessionStorage.removeItem(sessionStorageKey);
      setToken("");
      resetProductForm();
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `محصول «${product.name}» به‌صورت قطعی حذف شود؟`,
    );
    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setDeletingProductId(product.id);

    try {
      await deleteAdminProduct(token, product.id);
      if (editingProduct?.id === product.id) {
        resetProductForm();
      }
      setNotice(`محصول «${product.name}» حذف شد.`);
      dispatch(fetchProducts());
    } catch (deleteError) {
      handleAdminRequestError(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "حذف محصول انجام نشد.",
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await logoutAdmin(token);
    } catch {
      // Clear the browser session even if the server is unavailable.
    } finally {
      window.sessionStorage.removeItem(sessionStorageKey);
      setToken("");
      setBusy(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF9F5] px-4 py-10 font-[Vazirmatn,sans-serif] text-[#222222] sm:px-6"
    >
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#E7E5DF] bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#6D6D6D]">فروشگاه فامینا</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#173C35]">
              پنل مدیریت
            </h1>
          </div>
          {token && (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/orders"
                className="rounded-xl bg-[#E8EFEA] px-4 py-2 text-sm text-[#173C35]"
              >
                سفارش‌ها
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="rounded-xl border border-[#E7E5DF] px-4 py-2 text-sm text-[#173C35] disabled:opacity-50"
              >
                خروج
              </button>
            </div>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        {!token ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <h2 className="text-lg font-medium">ورود مدیر</h2>
            <label className="block space-y-2 text-sm">
              <span>نام کاربری</span>
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>رمز عبور</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#173C35] px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {busy ? "در حال ورود…" : "ورود"}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <section aria-labelledby="admin-products-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="admin-products-heading"
                    className="text-lg font-medium text-[#173C35]"
                  >
                    محصولات فروشگاه
                  </h2>
                  <p className="mt-1 text-xs text-[#6D6D6D]">
                    {products.length} محصول ثبت شده است.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(fetchProducts())}
                  disabled={productsLoading}
                  className="rounded-xl border border-[#E7E5DF] px-3 py-2 text-sm text-[#173C35] disabled:opacity-50"
                >
                  تازه‌سازی
                </button>
              </div>

              {productsError && products.length === 0 ? (
                <p
                  role="status"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {productsError}
                </p>
              ) : productsLoading && products.length === 0 ? (
                <p className="rounded-xl bg-[#FAF9F5] px-4 py-6 text-center text-sm text-[#6D6D6D]">
                  در حال دریافت محصولات…
                </p>
              ) : products.length === 0 ? (
                <p className="rounded-xl bg-[#FAF9F5] px-4 py-6 text-center text-sm text-[#6D6D6D]">
                  هنوز محصولی ثبت نشده است.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="flex min-w-0 gap-3 rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] p-3"
                    >
                      {product.imageGallery[0] ? (
                        <img
                          src={product.imageGallery[0].src}
                          alt={product.name}
                          className="h-24 w-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-[#E8EFEA] text-xs text-[#6D6D6D]">
                          بدون تصویر
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="truncate text-sm font-medium">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#6D6D6D]">
                          {formatPrice(product.price)} تومان ·{" "}
                          {product.material}
                        </p>
                        <p className="mt-1 text-xs text-[#6D6D6D]">
                          {product.availability ? "موجود" : "ناموجود"} ·{" "}
                          {product.imageGallery.length} تصویر
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => startEditingProduct(product)}
                            disabled={busy || deletingProductId !== null}
                            className="rounded-lg bg-[#E8EFEA] px-3 py-1.5 text-xs font-medium text-[#173C35] disabled:opacity-50"
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={busy || deletingProductId !== null}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                          >
                            {deletingProductId === product.id
                              ? "در حال حذف…"
                              : "حذف قطعی"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section
              id="product-form"
              aria-labelledby="product-form-heading"
              className="scroll-mt-6 border-t border-[#E7E5DF] pt-7"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2
                  id="product-form-heading"
                  className="text-lg font-medium text-[#173C35]"
                >
                  {editingProduct ? "ویرایش محصول" : "افزودن محصول"}
                </h2>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    disabled={busy}
                    className="rounded-lg border border-[#E7E5DF] px-3 py-1.5 text-xs text-[#6D6D6D] disabled:opacity-50"
                  >
                    انصراف از ویرایش
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-5">
                <label className="block space-y-2 text-sm">
                  <span>نام محصول</span>
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm">
                    <span>قیمت (تومان)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>جنس</span>
                    <select
                      value={material}
                      onChange={(event) =>
                        setMaterial(event.target.value as Product["material"])
                      }
                      className="w-full rounded-xl border border-[#D8D6CF] bg-white px-4 py-3 outline-none focus:border-[#173C35]"
                    >
                      {materials.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>امتیاز فعلی</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>تعداد نظرها</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={reviewCount}
                      onChange={(event) => setReviewCount(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6CF] px-4 py-3 outline-none focus:border-[#173C35]"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={availability}
                    onChange={(event) => setAvailability(event.target.checked)}
                    className="h-4 w-4 accent-[#173C35]"
                  />
                  محصول موجود است
                </label>

                {editingProduct && (
                  <div className="space-y-2">
                    <span className="block text-sm">تصاویر فعلی</span>
                    <div className="flex flex-wrap gap-2">
                      {editingProduct.imageGallery.map((image) => (
                        <img
                          key={image.id}
                          src={image.src}
                          alt={image.label}
                          className="h-16 w-16 rounded-lg border border-[#E7E5DF] object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <label className="block space-y-2 text-sm">
                  <span>
                    {editingProduct
                      ? "جایگزینی تصاویر (اختیاری)"
                      : "تصاویر محصول (حداکثر ۴ فایل)"}
                  </span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    required={!editingProduct}
                    onChange={handleImageSelection}
                    className="block w-full rounded-xl border border-[#D8D6CF] p-3 file:ml-3 file:rounded-lg file:border-0 file:bg-[#E8EFEA] file:px-3 file:py-2"
                  />
                  <span className="block text-xs text-[#6D6D6D]">
                    {editingProduct && images.length === 0
                      ? "اگر تصویر جدید انتخاب نکنید، تصاویر فعلی حفظ می‌شوند. انتخاب تصویر جدید کل گالری را جایگزین می‌کند."
                      : "JPEG، PNG یا WebP؛ حداکثر ۵ مگابایت برای هر فایل و ۱۰ مگابایت در مجموع."}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={busy || deletingProductId !== null}
                  className="w-full rounded-xl bg-[#173C35] px-4 py-3 font-medium text-white disabled:opacity-50"
                >
                  {busy
                    ? "در حال ذخیره…"
                    : editingProduct
                      ? "ذخیرهٔ تغییرات"
                      : "ثبت محصول"}
                </button>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
