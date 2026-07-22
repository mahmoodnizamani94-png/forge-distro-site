# RoboLawn PHP Website v15

## Requirements

- PHP 7.4 or newer
- A web server that processes PHP files

## Local preview

Run from the project directory:

```bash
php -S localhost:8000
```

Then open `http://localhost:8000`.

## Shared layout

Every public page uses:

```php
include 'header.php';
include 'footer.php';
```

`header.php` contains the common top bar, desktop navigation, and full-screen mobile navigation. `footer.php` contains the global footer and shared scripts.

## Mobile navigation

- The primary mobile menu slides in from the left and occupies the full viewport.
- Who We Serve and Resources open nested full-screen panels that slide in from the right.
- The main and nested panels include an X close button.
- Nested panels include a Back button.

## Robotic mower catalogue

The catalogue uses the reference card styling supplied for the LUBA and YUKA products: equal-height cards, discount labels, large product imagery, centered specifications, crossed-out regular prices, green sale prices, and responsive tabs.

External product and lawn images are loaded from the existing RoboLawn website and official Mammotion product CDN.
