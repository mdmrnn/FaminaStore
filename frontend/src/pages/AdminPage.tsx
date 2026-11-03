import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createAdminProduct,
  loginAdmin,
  logoutAdmin,
} from "../services/adminApi";
import type { AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";
import type { Product } from "../types/product";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  async function handleCreateProduct(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (images.length === 0 || images.length > maxImageCount) {
      setError("حداقل یک و حداکثر ۴ تصویر انتخاب کنید.");
      return;
    }

    if (
      images.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > maxImageSize,
      ) ||
      images.reduce((sum, file) => sum + file.size, 0) > maxTotalImageSize
    ) {
      setError("حجم یا قالب تصاویر انتخاب‌شده معتبر نیست.");
      return;
    }

    setBusy(true);

    try {
      const imageGallery = await Promise.all(
        images.map(async (file, index) => ({
          label: `تصویر محصول ${index + 1}`,
          dataUrl: await fileToDataUrl(file),
        })),
      );

      const createdProduct = await createAdminProduct(token, {
        name: name.trim(),
        price: Number(price),
        material,
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        availability,
        imageGallery,
      });

      setNotice(
        `محصول «${createdProduct.name}» ثبت شد و در فهرست فروشگاه قرار گرفت.`,
      );
      dispatch(fetchProducts());
      setName("");
      setPrice("");
      setRating("0");
      setReviewCount("0");
      setAvailability(true);
      setImages([]);
      const fileInput = document.getElementById(
        "product-images",
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (createError) {
      if (
        createError instanceof Error &&
        (createError as Error & { status?: number }).status === 401
      ) {
        window.sessionStorage.removeItem(sessionStorageKey);
        setToken("");
      }
      setError(
        createError instanceof Error
          ? createError.message
          : "ثبت محصول انجام نشد.",
      );
    } finally {
      setBusy(false);
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
          <form onSubmit={handleCreateProduct} className="space-y-5">
            <h2 className="text-lg font-medium">افزودن محصول</h2>
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

            <label className="block space-y-2 text-sm">
              <span>تصاویر محصول (حداکثر ۴ فایل)</span>
              <input
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                onChange={handleImageSelection}
                className="block w-full rounded-xl border border-[#D8D6CF] p-3 file:ml-3 file:rounded-lg file:border-0 file:bg-[#E8EFEA] file:px-3 file:py-2"
              />
              <span className="block text-xs text-[#6D6D6D]">
                JPEG، PNG یا WebP؛ حداکثر ۵ مگابایت برای هر فایل و ۱۰ مگابایت در
                مجموع.
              </span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#173C35] px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {busy ? "در حال ثبت محصول…" : "ثبت محصول"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
