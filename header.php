<?php
$pageTitle = $pageTitle ?? 'RoboLawn';
$pageDescription = $pageDescription ?? "Florida's robotic lawn care company.";
$currentPage = basename($_SERVER['PHP_SELF'] ?? 'index.php');
function active_page(array $pages): string { global $currentPage; return in_array($currentPage, $pages, true) ? ' active' : ''; }
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
<div class="scroll-progress" aria-hidden="true"></div>
<div class="top-strip">
  <div class="container d-flex justify-content-between align-items-center gap-3">
    <div class="top-contact d-flex flex-wrap align-items-center gap-3">
      <a href="mailto:robolawnus@gmail.com"><i class="bi bi-envelope"></i> robolawnus@gmail.com</a>
      <a href="tel:+19414457128"><i class="bi bi-telephone"></i> 941-445-7128</a>
    </div>
    <div class="top-actions d-none d-md-flex gap-2">
      <a class="top-action top-action-primary" href="contact.php">GET A QUOTE</a>
      <a class="top-action top-action-secondary" href="become-a-dealer.php">BECOME A DEALER</a>
    </div>
  </div>
</div>
<header class="site-header sticky-top">
  <nav class="navbar navbar-expand-xl" aria-label="Primary navigation">
    <div class="container">
      <a class="brand-mark" href="index.php" aria-label="RoboLawn home">
        <span class="brand-icon"><i class="bi bi-robot"></i></span>
        <span class="brand-word"><strong>ROBO</strong><em>LAWN</em></span>
      </a>
      <button class="mobile-nav-trigger d-xl-none" type="button" aria-controls="mobileNav" aria-expanded="false" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <div class="collapse navbar-collapse d-none d-xl-flex" id="desktopNav">
        <ul class="navbar-nav ms-auto align-items-xl-center">
          <li class="nav-item"><a class="nav-link<?= active_page(['index.php']) ?>" href="index.php">Home</a></li>
          <li class="nav-item dropdown desktop-dropdown">
            <button class="nav-link dropdown-toggle<?= active_page(['residential-properties.php','community-associations.php','commercial-properties.php','landscape-companies.php']) ?>" type="button" aria-expanded="false">Who We Serve <i class="bi bi-chevron-down"></i></button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="residential-properties.php">Residential Properties</a></li>
              <li><a class="dropdown-item" href="community-associations.php">Community Associations</a></li>
              <li><a class="dropdown-item" href="commercial-properties.php">Commercial Properties</a></li>
              <li><a class="dropdown-item" href="landscape-companies.php">Landscape Companies</a></li>
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link<?= active_page(['robotic-mowers.php']) ?>" href="robotic-mowers.php">Robotic Mowers</a></li>
          <li class="nav-item"><a class="nav-link<?= active_page(['dealers.php']) ?>" href="dealers.php">Dealers</a></li>
          <li class="nav-item dropdown desktop-dropdown">
            <button class="nav-link dropdown-toggle<?= active_page(['services.php','pro-tips.php','videos.php','faqs.php']) ?>" type="button" aria-expanded="false">Resources <i class="bi bi-chevron-down"></i></button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="services.php">Service &amp; Support</a></li>
              <li><a class="dropdown-item" href="pro-tips.php">Pro Tips</a></li>
              <li><a class="dropdown-item" href="videos.php">Videos</a></li>
              <li><a class="dropdown-item" href="faqs.php">Frequently Asked Questions</a></li>
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link<?= active_page(['about.php']) ?>" href="about.php">About Us</a></li>
          <li class="nav-item"><a class="nav-link<?= active_page(['contact.php']) ?>" href="contact.php">Contact Us</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>
<div class="mobile-nav-shell d-xl-none" id="mobileNav" aria-hidden="true">
  <div class="mobile-nav-main mobile-panel">
    <div class="mobile-panel-head">
      <a class="brand-mark" href="index.php"><span class="brand-icon"><i class="bi bi-robot"></i></span><span class="brand-word"><strong>ROBO</strong><em>LAWN</em></span></a>
      <button class="mobile-nav-close" type="button" aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="mobile-nav-list">
      <a href="index.php">Home</a>
      <button type="button" data-submenu="serveSubmenu"><span>Who We Serve</span><i class="bi bi-arrow-right"></i></button>
      <a href="robotic-mowers.php">Robotic Mowers</a>
      <a href="dealers.php">Dealers</a>
      <button type="button" data-submenu="resourcesSubmenu"><span>Resources</span><i class="bi bi-arrow-right"></i></button>
      <a href="about.php">About Us</a>
      <a href="contact.php">Contact Us</a>
    </div>
    <div class="mobile-cta-grid">
      <a class="btn-brand" href="contact.php">GET A QUOTE <i class="bi bi-arrow-right"></i></a>
      <a class="btn-outline" href="become-a-dealer.php">BECOME A DEALER <i class="bi bi-arrow-right"></i></a>
    </div>
  </div>
  <section class="mobile-submenu mobile-panel" id="serveSubmenu" aria-hidden="true">
    <div class="mobile-panel-head">
      <button class="submenu-back" type="button"><i class="bi bi-arrow-left"></i> BACK</button>
      <button class="mobile-nav-close" type="button" aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="mobile-submenu-body">
      <span class="kicker">SOLUTIONS</span><h2>Who We Serve</h2>
      <a href="residential-properties.php">Residential Properties <i class="bi bi-arrow-right"></i></a>
      <a href="community-associations.php">Community Associations <i class="bi bi-arrow-right"></i></a>
      <a href="commercial-properties.php">Commercial Properties <i class="bi bi-arrow-right"></i></a>
      <a href="landscape-companies.php">Landscape Companies <i class="bi bi-arrow-right"></i></a>
    </div>
  </section>
  <section class="mobile-submenu mobile-panel" id="resourcesSubmenu" aria-hidden="true">
    <div class="mobile-panel-head">
      <button class="submenu-back" type="button"><i class="bi bi-arrow-left"></i> BACK</button>
      <button class="mobile-nav-close" type="button" aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="mobile-submenu-body">
      <span class="kicker">RESOURCES</span><h2>Support &amp; Learning</h2>
      <a href="services.php">Service &amp; Support <i class="bi bi-arrow-right"></i></a>
      <a href="pro-tips.php">Pro Tips <i class="bi bi-arrow-right"></i></a>
      <a href="videos.php">Videos <i class="bi bi-arrow-right"></i></a>
      <a href="faqs.php">Frequently Asked Questions <i class="bi bi-arrow-right"></i></a>
    </div>
  </section>
</div>
