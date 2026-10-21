logo

# Design Token System

Chuẩn thiết kế cho dự án Flutter — bản đầy đủ

[Màu](#colors) [Semantic](#semantic) [Type](#type) [Spacing](#spacing) [Radius](#radius) [Elevation](#elevation) [Icon](#icon) [States](#states) [Breakpoint](#breakpoints) [Motion](#motion) [A11y](#a11y) [Export](#export)

## 1 · Bảng màu gốc

3 màu bạn cung cấp + surface đề xuất để có nền phụ (card, sheet) tách khỏi nền chính.

**Background**`#DDDBBB`

**Primary / Accent**`#884730`

**Text / Dark**`#282932`

**Surface (đề xuất)**`#FFFDF2`

## 2 · Màu Semantic & trạng thái

Bổ sung: màu phản hồi hành động (thành công / cảnh báo / lỗi / thông tin), màu disabled và divider — pha từ cùng tông ấm/trung tính để hợp bảng màu gốc.

**Success**`#4C7A4C`

**Warning**`#B4791F`

**Error**`#A53F3F`

**Info**`#3F6FA5`

**Disabled**`#9C998A`

**Divider**`rgba(40,41,50,.14)`

Thao tác thành công — đã lưu thay đổi.

Cảnh báo — vui lòng kiểm tra lại thông tin.

Lỗi — không thể kết nối máy chủ.

Thông tin — phiên bản mới đã sẵn sàng.

## 3 · Type scale đầy đủ

Times New Roman cho heading, Arial cho body — kèm line-height, letter-spacing, font-weight từng cấp.

Display / 34Display Times 34lh 1.2 · w700

H1 / 26Heading 1lh 1.25 · w700

H2 / 20Heading 2lh 1.3 · w600

H3 / 17Heading 3lh 1.35 · w600

Body L / 16Body lớn — nội dung chínhlh 1.5 · w400

Body M / 14Body vừa — mô tả phụlh 1.5 · w400

Button / 14BUTTON TEXTls .3px · w700

Caption / 12Caption — chú thích nhỏlh 1.4 · w400

Overline / 11OVERLINE LABELls 1px · uppercase

## 4 · Spacing — thước 8

Nhân bội số của 8, có thêm nấc 4 (half-step) cho layout nhỏ.

xs — 4

sm — 8

md — 16

lg — 24

xl — 32

2xl — 40

3xl — 48

4xl — 64

## 5 · Border Radius

Cùng nhịp 8/24: 4 – 8 – 12 – 16 – 24 (full cho chip, avatar).

4 / sm

8 / md

12 / lg

16 / xl

24 / full

## 6 · Elevation / Shadow

4 mức đổ bóng tương ứng Material elevation trong Flutter — card, dialog, bottom sheet, FAB.

elevation 0

elevation 1 — card

elevation 2 — appbar

elevation 3 — sheet

elevation 4 — dialog

## 7 · Icon sizes

Kích cỡ icon chuẩn theo thước 8: 16 / 20 / 24 / 32, style outline đồng bộ với màu primary.

16px

20px

24px

32px

## 8 · Component states

Default / Pressed / Disabled / Focus — áp cho button, input, checkbox để UX nhất quán.

### Card Title

Mô tả ngắn, radius-lg, spacing md.

Chip / Tag

## 9 · Breakpoints / Grid

Theo cùng nhịp 8 cho responsive (phone / phone-lớn / tablet / tablet-ngang).

compact — 360

360dp

medium — 600

600dp

expanded — 840

840dp

large — 1024

1024dp

## 10 · Motion / Animation

Duration chuẩn 150 / 250 / 350ms, easing `cubic-bezier(.2,0,.2,1)` — dùng nhất quán cho transition.

fast — 150ms

base — 250ms

slow — 350ms

## 11 · Accessibility — contrast

Kiểm tra sơ bộ tỉ lệ tương phản (WCAG) giữa các cặp màu chính.

Aa 884730 / nền DDDBBB

Ratio ≈ 3.9:1Fail AA (text nhỏ)

Aa 282932 / nền DDDBBB

Ratio ≈ 11.7:1Pass AA + AAA

Aa FFF8EE / nền 884730

Ratio ≈ 5.3:1Pass AA

→ **#884730 trên nền #DDDBBB** không đạt AA cho chữ nhỏ (\<18px): chỉ dùng cho icon/label lớn, hoặc đổi chữ chính sang #282932 và để #884730 làm accent/button nền đậm.

## 12 · Export sang Flutter

Toàn bộ token trên map trực tiếp vào `app_theme.dart` để dùng chung giữa Figma/HTML preview và code.

| Token | Giá trị | Flutter |
| --- | --- | --- |
| colorBackground | `#DDDBBB` | `scaffoldBackgroundColor` |
| colorPrimary | `#884730` | `ColorScheme.primary` |
| colorOnDark | `#282932` | `ColorScheme.onBackground` |
| success/warning/error/info | xem mục 2 | `ThemeExtension<AppColors>` |
| fontFamilyDisplay | Times New Roman | `textTheme.headlineLarge/Medium` |
| fontFamilyBody | Arial | `textTheme.bodyMedium` |
| spacing.xs → 4xl | 4/8/16/24/32/40/48/64 | `EdgeInsets.all(spacing.md)` |
| radius.sm → full | 4/8/12/16/24 | `BorderRadius.circular(radius.md)` |
| elevation.0 → 4 | xem mục 6 | `Card(elevation: …)` |
| duration.fast/base/slow | 150/250/350ms | `AnimatedContainer(duration: …)` |

```
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xl2 = 40;
  static const double xl3 = 48;
  static const double xl4 = 64;
}

class AppRadius {
  static const double sm = 4;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double full = 24;
}

final appTheme = ThemeData(
  scaffoldBackgroundColor: const Color(0xFFDDDBBB),
  colorScheme: ColorScheme.light(
    primary: const Color(0xFF884730),
    onBackground: const Color(0xFF282932),
    error: const Color(0xFFA53F3F),
  ),
  textTheme: const TextTheme(
    headlineLarge: TextStyle(fontFamily: 'Times New Roman', fontSize: 26, fontWeight: FontWeight.w700),
    bodyMedium: TextStyle(fontFamily: 'Arial', fontSize: 16, height: 1.5),
  ),
);
```

Design Token Preview · generated for Flutter project