# Autentikasi & Manajemen Sesi (Frontend)

Dokumen ini menjelaskan bagaimana aplikasi React (TanStack Router + Context) mengelola login, signup, token, dan proteksi route. Detail sisi server ada di `kdpl-tubes-backend/docs/authentication.md`.

## Ringkasan

- Token JWT dan data user disimpan di `localStorage`.
- State auth dikelola `AuthProvider` (`src/context/auth-context.tsx`) dan dibaca lewat `useAuth()`.
- Route yang butuh login dilindungi `beforeLoad` pada layout route `_authenticated`.
- Setiap request ke API otomatis menyertakan `Authorization: Bearer <token>` (`src/services/api-client.ts`).
- Otorisasi edit/hapus artikel di UI hanya untuk tampilan. Backend tetap memvalidasi.

## File Terkait

| File                                            | Peran                                                         |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `src/services/api-client.ts`                    | Get/set/clear token, `apiRequest` (header Bearer, `ApiError`) |
| `src/services/auth.service.ts`                  | Panggilan `signup`, `login`, `getMe`                          |
| `src/context/auth-context.tsx`                  | `AuthProvider`, `useAuth`, cache user, `canEditOrDelete`      |
| `src/routes/_authenticated.tsx`                 | Guard route privat                                            |
| `src/routes/login.tsx`, `src/routes/signup.tsx` | Redirect jika sudah login                                     |
| `src/components/layout/navbar.tsx`              | Tombol logout                                                 |

## Penyimpanan

| Key `localStorage` | Isi                                    | Diatur oleh                           |
| ------------------ | -------------------------------------- | ------------------------------------- |
| `kdpl_auth_token`  | JWT dari server                        | `setStoredToken` / `clearStoredToken` |
| `kdpl_auth_user`   | Objek `User` (cache untuk render awal) | `setCachedUser` di `AuthProvider`     |

Cache `kdpl_auth_user` hanya untuk tampilan awal. Data yang sebenarnya diverifikasi lewat `GET /api/auth/me` saat aplikasi dimuat.

## Alur Login

```mermaid
sequenceDiagram
  autonumber
  participant U as Pengguna
  participant LP as LoginPage
  participant AC as AuthProvider
  participant AS as authService
  participant API as Backend
  participant LS as localStorage

  U->>LP: Submit email & password
  LP->>AC: login({ email, password })
  AC->>AS: login(payload)
  AS->>API: POST /api/auth/login
  alt Gagal (401 / jaringan)
    API-->>AS: error
    AS-->>LP: ApiError (pesan ditampilkan)
  else Sukses
    API-->>AS: { user, token }
    AS-->>AC: AuthData
    AC->>LS: kdpl_auth_token = token
    AC->>LS: kdpl_auth_user = user
    AC-->>AC: setUser(user)
    AC-->>LP: user
    LP->>LP: navigate(redirectTo ?? '/')
  end
```

Signup (`SignupPage`) mengikuti alur yang sama, memanggil `signup()` dan langsung menyimpan token dari respons. Setelah berhasil, user diarahkan ke `/`.

## Inisialisasi Sesi Saat Aplikasi Dimuat

```mermaid
flowchart TD
  S[Aplikasi dimuat] --> T{kdpl_auth_token ada?}
  T -- Tidak --> N["user = null<br/>isLoading = false"]
  T -- Ya --> C["user = cache kdpl_auth_user<br/>isLoading = true"]
  C --> M["GET /api/auth/me"]
  M -- Sukses --> U["setUser + update cache"]
  M -- Gagal --> X["clear token & cache<br/>user = null"]
  U --> D["isLoading = false"]
  X --> D
```

## Proteksi Route

```mermaid
flowchart TD
  R[Navigasi ke route] --> Q{Route bertipe}
  Q -- "_authenticated/*" --> A{kdpl_auth_token ada?}
  A -- Tidak --> L1["redirect /login?redirect=path asal"]
  A -- Ya --> OK1[Render halaman]
  Q -- "/login atau /signup" --> B{kdpl_auth_token ada?}
  B -- Ya --> L2["redirect ke redirect param atau /"]
  B -- Tidak --> OK2[Render halaman]
  Q -- Publik --> OK3[Render halaman]
```

Guard hanya memeriksa keberadaan token, bukan validitasnya. Token yang sudah expired akan lolos guard. Halaman tetap render sampai `GET /api/auth/me` gagal, lalu `refreshUser()` menghapus sesi. Nilai `isLoading` dari `useAuth()` tidak dipakai guard maupun halaman.

## Logout

1. `Navbar` memanggil `logout()`.
2. `logout()` menghapus `kdpl_auth_token` dan `kdpl_auth_user`, lalu `user = null`.
3. `navigate({ to: '/' })`.

Tidak ada panggilan ke server. Token lama tetap valid di server sampai expired.

## Status Sesi

```mermaid
stateDiagram-v2
  [*] --> Anonim: tidak ada token
  [*] --> Memuat: token ada di storage
  Memuat --> Terautentikasi: GET /me sukses
  Memuat --> Anonim: GET /me gagal (sesi dihapus)
  Anonim --> Terautentikasi: login / signup sukses
  Terautentikasi --> Anonim: logout()
  Terautentikasi --> Anonim: GET /me gagal (refresh)
```

## Pengiriman Request ke API

```mermaid
flowchart LR
  F[apiRequest] --> H{Ada token?}
  H -- Ya --> AU["Authorization: Bearer token"]
  H -- Tidak --> NA[Tanpa header Authorization]
  AU --> SEND[fetch VITE_API_URL + endpoint]
  NA --> SEND
  SEND --> P{response.ok dan success?}
  P -- Ya --> D[return payload.data]
  P -- Tidak --> ERR["throw ApiError(message, status)"]
```

- Base URL diambil dari `VITE_API_URL` (contoh: `http://localhost:8787`).
- Error dari server ditampilkan lewat `ApiError.message`.
- Respons 401 dari endpoint lain tidak memicu logout otomatis. Sesi dihapus hanya saat `GET /api/auth/me` gagal.

## Otorisasi di UI

`canEditOrDelete(article)` menentukan apakah tombol edit/hapus muncul:

- `admin` selalu `true`.
- Selain itu, `true` jika `article.author.id` (atau `authorId`) sama dengan `user.id`.

Pengecekan ini hanya untuk tampilan. Backend tetap menolak aksi yang tidak diizinkan (403).

## Peringatan Keamanan

- **Token di `localStorage`** dapat dibaca skrip apa pun yang berjalan di halaman. Celah XSS bisa membocorkan token.
- **Guard tidak memvalidasi token.** Token expired tidak langsung memaksa logout sampai `/me` dipanggil.
- **Tidak ada penanganan 401 global.** Request lain yang gagal karena token expired hanya menampilkan error.
- **Cache `kdpl_auth_user` bisa basi** (misal role berubah di server) sampai `/me` selesai.

## Terkait

- Alur autentikasi di sisi backend: `kdpl-tubes-backend/docs/authentication.md`
