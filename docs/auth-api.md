# API Auth

Tài liệu mô tả code hiện tại, đối chiếu ngày 16/10/2026. Các response bên dưới là ví dụ theo controller, service, interceptor và exception filter; không phải kết quả gọi API trực tiếp.

## 1. Quy ước chung

- Base URL mặc định khi chạy local: `http://localhost:3000/api`. Port thực tế lấy từ `PORT`, mặc định `3000`.
- Prefix của auth: `/auth`.
- Body có dữ liệu sử dụng `Content-Type: application/json`.
- Access token gửi qua header `Authorization: Bearer <accessToken>`.
- Refresh token gửi trong JSON body, không gửi thay access token vào header.
- API trả token trong JSON; hiện không tự thiết lập hoặc xóa cookie.
- Các endpoint đều dùng `POST` và chưa đặt `@HttpCode`, nên thành công trả **HTTP 201 Created**.
- `login` và `refresh` trả header `Cache-Control: no-store` khi thành công.
- CORS hiện cho phép origin `http://localhost:3001`, với `credentials: true`.

| Method | Endpoint | Xác thực đầu vào | Giới hạn cấu hình |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Username và password | 5 request / 60 giây |
| POST | `/api/auth/refresh` | Refresh token trong body | 60 request / 60 giây |
| POST | `/api/auth/logout` | Refresh token trong body | 60 request / 60 giây |
| POST | `/api/auth/logout-all` | Access token trong header | 60 request / 60 giây |

Giới hạn được tính riêng theo endpoint và tracker IP mà Throttler xác định từ request, không theo username. Cấu hình hiện dùng bộ nhớ của từng instance. Khi bị giới hạn, API trả `429` và header `Retry-After` tính bằng giây. CORS hiện chưa cấu hình `exposedHeaders`, nên JavaScript gọi khác origin chưa đọc được header này.

## 2. Định dạng response

### Thành công

```json
{
  "success": true,
  "statusCode": 201,
  "code": 0,
  "message": "Success",
  "data": {},
  "timestamp": "2026-10-16T03:00:00.000Z"
}
```

`data` phụ thuộc endpoint. `code` khi thành công là số; khi thất bại là chuỗi. `timestamp` là thời gian UTC ở định dạng ISO 8601.

### Thất bại

Ví dụ đăng nhập sai:

```json
{
  "success": false,
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "message": "Username or password is incorrect",
  "errors": null,
  "data": null,
  "method": "POST",
  "path": "/api/auth/login",
  "timestamp": "2026-10-16T03:00:00.000Z"
}
```

Lỗi validation DTO trả `400`, `code: "VALIDATION_ERROR"`, và `errors` là mảng chuỗi mô tả từng lỗi. Với các body có DTO (`login`, `refresh`, `logout`), gửi trường ngoài DTO cũng bị từ chối do `forbidNonWhitelisted: true`. `logout-all` không nhận body DTO.

## 3. Đăng nhập

### `POST /api/auth/login`

Không yêu cầu header Authorization.

| Trường | Kiểu | Bắt buộc | Ràng buộc |
| --- | --- | --- | --- |
| `username` | string | Có | Không rỗng, tối đa 100 ký tự |
| `password` | string | Có | Không rỗng, tối đa 255 ký tự |

DTO hiện không tự trim hoặc chuyển username sang chữ thường. Gửi password đúng nguyên bản.

```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "demo_user",
  "password": "example-password"
}
```

Tài khoản trong ví dụ chỉ minh họa định dạng; cần thay bằng tài khoản đã tồn tại.

**Response — HTTP 201:**

```json
{
  "success": true,
  "statusCode": 201,
  "code": 0,
  "message": "Success",
  "data": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "tokenType": "Bearer"
  },
  "timestamp": "2026-10-16T03:00:00.000Z"
}
```

- Username không tồn tại, password sai hoặc tài khoản không ở trạng thái `ACTIVE`: `401`, message `Username or password is incorrect`.
- Mỗi lần đăng nhập thành công tạo một session riêng. Cùng một tài khoản có thể đăng nhập nhiều thiết bị với các session khác nhau.
- Response không có `user`, `roles`, `permissions` hoặc `expiresIn`.

## 4. Làm mới token

### `POST /api/auth/refresh`

Không yêu cầu access token; có thể gọi khi access token đã hết hạn.

| Trường | Kiểu | Bắt buộc | Ràng buộc |
| --- | --- | --- | --- |
| `refreshToken` | string | Có | Không rỗng, tối đa 4096 ký tự |

```http
POST /api/auth/refresh HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "<current-refresh-token>"
}
```

**Response — HTTP 201:** cùng cấu trúc với login, gồm một access token mới và một refresh token mới trong `data`.

Client phải thay **cả hai token** sau khi refresh thành công. Refresh token cũ không còn dùng được để refresh. Access token cũ không bị thu hồi chỉ vì refresh thành công; nó còn dùng được tới khi hết hạn hoặc session/tài khoản bị vô hiệu hóa.

Refresh không kéo dài thời hạn tuyệt đối của session: refresh token mới giữ thời điểm hết hạn của refresh token ban đầu. Access token mới cũng không sống lâu hơn session.

| HTTP | Message | Trường hợp |
| --- | --- | --- |
| 401 | `Invalid refresh token` | Token sai chữ ký, sai loại, sai issuer/audience, hết hạn hoặc claims không hợp lệ |
| 401 | `Session is no longer valid` | User không tồn tại, không active hoặc `authVersion` đã thay đổi |
| 401 | `Session expired` | Session hết hạn tại thời điểm chuẩn bị cấp token |
| 401 | `Session expired, revoked, or token reused` | Session không còn hợp lệ hoặc refresh token đã được dùng |

### Refresh đồng thời và retry

Server chỉ cho một request xoay thành công một refresh token. Khi một request khác gửi lại token đó, server từ chối và thu hồi session tương ứng. Vì vậy, hai request refresh đồng thời có thể dẫn tới một request trả `201`, request kia trả `401`, nhưng cặp token vừa nhận cũng không còn dùng được sau khi session bị thu hồi.

Client nên:

1. Chỉ để một request refresh chạy cho mỗi session; các request khác chờ chung kết quả.
2. Nếu nhiều tab dùng chung session, phối hợp refresh giữa các tab.
3. Cập nhật đồng thời cặp token mới trước khi tiếp tục các request đang chờ.
4. Khi refresh trả `401`, xóa token phía client và yêu cầu đăng nhập lại.
5. Không tự động gửi lại refresh token cũ khi mất response: server có thể đã xoay token và lần gửi lại sẽ thu hồi session. API hiện không có cơ chế phục hồi cặp token của lần refresh đó.

Các thiết bị đăng nhập riêng có session riêng; việc thu hồi một session không tự thu hồi session khác của cùng tài khoản.

## 5. Đăng xuất một session

### `POST /api/auth/logout`

Không yêu cầu access token. Body dùng cùng DTO với refresh.

```http
POST /api/auth/logout HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "<refresh-token>"
}
```

**Response — HTTP 201:**

```json
{
  "success": true,
  "statusCode": 201,
  "code": 0,
  "message": "Success",
  "data": {
    "message": "Logged out."
  },
  "timestamp": "2026-10-16T03:00:00.000Z"
}
```

- Thu hồi session được xác định bởi refresh token. Những lần xác thực tiếp theo qua `JwtAuthGuard` và refresh của session đó sẽ bị từ chối.
- Không hủy những request đã vượt qua bước xác thực và đang xử lý.
- Refresh token phải còn hạn và hợp lệ về chữ ký/claims. Token sai hoặc hết hạn trả `401`, message `Invalid refresh token`.
- Một refresh token cũ đã được xoay nhưng còn hạn vẫn có thể logout cùng session đó.
- Gọi lại logout với token hợp lệ của session đã thu hồi vẫn trả thành công; token hết hạn vẫn trả `401`.
- Client tự xóa cặp token đang giữ. API không tự xóa cookie hay bộ nhớ phía client.

## 6. Đăng xuất tất cả session

### `POST /api/auth/logout-all`

Yêu cầu access token hợp lệ của chính tài khoản cần đăng xuất. Không cần body, không truyền `userId`.

```http
POST /api/auth/logout-all HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access-token>
```

**Response — HTTP 201:**

```json
{
  "success": true,
  "statusCode": 201,
  "code": 0,
  "message": "Success",
  "data": {
    "message": "All refresh tokens have been revoked"
  },
  "timestamp": "2026-10-16T03:00:00.000Z"
}
```

Server tăng `authVersion` của tài khoản. Cả access token và refresh token mang version cũ bị từ chối ở những lần kiểm tra tiếp theo, bao gồm token của session vừa gọi endpoint. Message hiện tại nhắc đến refresh token, nhưng hiệu lực thu hồi áp dụng cho cả hai loại token cũ.

- Thiếu access token, token hết hạn hoặc không hợp lệ: `401`.
- Tài khoản/session không còn hợp lệ: `401`.
- Nếu access token đã hết hạn, cần refresh thành công rồi dùng access token mới để gọi endpoint này.
- Client xóa token sau khi thành công. Gọi lại bằng access token vừa bị vô hiệu hóa sẽ trả `401`.
- Không hủy request đã qua xác thực; đăng nhập mới lấy version mới vẫn có thể tạo session mới.

## 7. Token và phân quyền

| Thuộc tính | Access token | Refresh token |
| --- | --- | --- |
| Cách gửi | Header Bearer | Body `refreshToken` |
| `tokenType` trong JWT | `access` | `refresh` |
| `aud` | `sale-access` | `sale-refresh` |
| `iss` | `sale-api` | `sale-api` |
| Claims chung | `sub`, `sid`, `username`, `authVersion`, `iat`, `exp` | Như access token |
| Claim riêng | — | `jti`, thay đổi sau mỗi refresh |

`sub` là user ID dạng **string**; `sid` là ID session. `iat` và `exp` tính theo giây Unix. `tokenType: "Bearer"` trong response là cách gửi token, khác với `tokenType` bên trong JWT.

Thời hạn lấy từ cấu hình server, không có một giá trị mặc định cố định trong API:

| Biến cấu hình | Quy tắc hiện tại |
| --- | --- |
| `JWT_ACCESS_EXPIRES_IN` | Số nguyên dương kèm `s`, `m`, `h` hoặc `d`; tối đa 1 giờ |
| `JWT_REFRESH_EXPIRES_IN` | Cùng định dạng; tối đa 90 ngày, không ngắn hơn thời hạn access token |

Client có thể đọc `exp` để lên lịch refresh, nhưng việc đọc payload không thay thế xác thực token phía server.

JWT và response login/refresh hiện không chứa roles hoặc permissions. Khi endpoint dùng `JwtAuthGuard`, `JwtStrategy` đọc quyền hiện tại từ database và gắn vào `request.user` ở backend:

```ts
{
  id: string;
  sid: string;
  username: string;
  roles: string[];
  permissions: string[];
}
```

Permissions được loại trùng và chỉ lấy permission đang active. Endpoint nghiệp vụ cần guard kiểm tra quyền tương ứng để thực thi phân quyền. Auth module hiện có đúng bốn endpoint nêu trên; chưa cung cấp `/auth/me`, đăng ký, đổi mật khẩu hoặc quên mật khẩu.

## 8. Xử lý lỗi phía client

| HTTP | Code thường gặp | Cách xử lý |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Hiển thị lỗi từ `errors`, sửa body theo DTO |
| 401 | `UNAUTHORIZED` | Login: báo đăng nhập thất bại; refresh: yêu cầu đăng nhập lại; request có access token: chỉ thử refresh một lần nếu còn refresh token |
| 429 | `TOO_MANY_REQUESTS` | Tạm ngừng gửi lại, chờ hết giới hạn; dùng `Retry-After` khi client đọc được header |
| 503 | `DATABASE_DEADLOCK`, `DATABASE_LOCK_TIMEOUT` | Báo lỗi tạm thời; xử lý retry phù hợp từng thao tác, lưu ý quy tắc refresh ở trên |
| 500 | `DATABASE_ERROR`, `INTERNAL_SERVER_ERROR` | Báo lỗi hệ thống; không coi response là đăng nhập/refresh thành công |

Không đưa chính request `/auth/refresh` vào vòng lặp tự refresh khi gặp `401`. Giới hạn việc gửi lại request gốc sau refresh để tránh vòng lặp khi session đã bị thu hồi.

## 9. Code tham chiếu

- [AuthController](../src/modules/auth/auth.controller.ts): endpoint, guard, header và giới hạn login.
- [AuthService](../src/modules/auth/auth.service.ts): cấp token, xoay refresh token và logout.
- [LoginDto](../src/modules/auth/dto/login.dto.ts), [RefreshTokenDto](../src/modules/auth/dto/refresh-token.dto.ts): validation body.
- [JwtStrategy](../src/modules/auth/jwt.strategy.ts): xác thực access token và nạp quyền.
- [AuthSettings](../src/modules/auth/auth-settings.ts): cấu hình token.
- [UsersService](../src/modules/users/users.service.ts): trạng thái tài khoản và tăng `authVersion`.
- [ResponseInterceptor](../src/common/interceptors/response.interceptor.ts), [GlobalExceptionFilter](../src/common/exceptions/global-exception.filter.ts): định dạng response.
- [main.ts](../src/main.ts), [AppModule](../src/app.module.ts): prefix, CORS, validation và throttling.
