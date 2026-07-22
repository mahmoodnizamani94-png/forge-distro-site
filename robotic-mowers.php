<?php
$pageTitle = 'Robotic Mowers | RoboLawn';
$pageDescription = 'Browse RoboLawn’s LUBA AWD and YUKA robotic mower product categories.';
require_once 'content.php';
include 'header.php';
?>
<style>
@media (min-width: 992px){
  .product-grid>.product-card:nth-last-child(1):nth-child(3n+1){grid-column:2}
  .product-grid>.product-card:first-child:nth-last-child(2){grid-column:1}
}
</style>
<?php
render_page('products');
include 'footer.php';
