<?php
const RL_IMG_BANNER = 'https://robolawnus.com/wp-content/uploads/2024/05/Banner-scaled.png';
const RL_IMG_SLOPE = 'https://robolawnus.com/wp-content/uploads/2025/09/80-Slope.jpg';
const RL_IMG_VERTICAL = 'https://robolawnus.com/wp-content/uploads/2024/05/Banner-%E5%9C%BA%E6%99%AF0205LUBAx-scaled.jpg';
const RL_IMG_PRODUCT = 'https://robolawnus.com/wp-content/uploads/2024/05/LUBA-mini_20240822_Alan_8K-removebg-preview-e1757628823134.png';
const RL_IMG_LIDAR = 'https://robolawnus.com/wp-content/uploads/2024/05/LiDAR-2-scaled.png';
const RL_IMG_COMPLEX = 'https://robolawnus.com/wp-content/uploads/2024/05/complex-yard-1-scaled.png';
const RL_IMG_OBSTACLE = 'https://robolawnus.com/wp-content/uploads/2024/05/obstacle-avoidance-21-scaled.png';
const RL_IMG_CLIMB = 'https://robolawnus.com/wp-content/uploads/2024/05/climbing-ability-scaled.png';
const RL_IMG_SIGNAL = 'https://robolawnus.com/wp-content/uploads/2024/05/LUBA-mini-Mow-anywhere-no-signal-worries.png';
const RL_IMG_PRINT = 'https://robolawnus.com/wp-content/uploads/2024/05/LUBA-mini_3D-Lawn-Printing.png';
const RL_IMG_AI = 'https://robolawnus.com/wp-content/uploads/2024/05/LUBA-mini-Beyond-Positioning-UltraSense-AI-Vision-Delivers-More.png';
const RL_LUBA_PRODUCT = 'https://us.mammotion.com/cdn/shop/files/LUBA-X-H.webp?v=1741313360&width=2000';
const RL_YUKA_PRODUCT = 'https://us.mammotion.com/cdn/shop/files/product_pic-YUKA_mini_MUSE.jpg?v=1758783512&width=2000';

function hero(string $title, string $intro, string $image, string $kicker = 'ROBO LAWN', bool $buttons = false): void { ?>
<section class="hero">
  <img src="<?= $image ?>" alt="<?= htmlspecialchars($title) ?>" loading="eager">
  <div class="container hero-content">
    <span class="kicker"><?= htmlspecialchars($kicker) ?></span>
    <h1><?= htmlspecialchars($title) ?></h1>
    <p><?= htmlspecialchars($intro) ?></p>
    <?php if ($buttons): ?><div class="hero-actions"><a class="btn-light-brand" href="contact.php">GET A QUOTE <i class="bi bi-arrow-right"></i></a><a class="btn-outline" href="become-a-dealer.php">BECOME A DEALER <i class="bi bi-arrow-right"></i></a></div><?php endif; ?>
  </div>
  <a class="scroll-cue" href="#page-content" aria-label="Scroll to content"><i class="bi bi-arrow-down"></i></a>
</section>
<?php }

function content_section(string $title, string $html, string $image, bool $reverse = false, bool $soft = false): void { ?>
<section class="section <?= $soft ? 'section-soft' : '' ?>">
  <div class="container content-grid <?= $reverse ? 'reverse' : '' ?>">
    <div class="content-image"><img src="<?= $image ?>" alt="<?= htmlspecialchars($title) ?>" loading="lazy"></div>
    <div class="content-copy"><h2><?= htmlspecialchars($title) ?></h2><?= $html ?></div>
  </div>
</section>
<?php }

function cta_section(string $title, string $text, string $button, string $href, string $image = RL_IMG_BANNER): void { ?>
<section class="section"><div class="container"><div class="cta-wrap"><img src="<?= $image ?>" alt="Robotic mower on a lawn" loading="lazy"><div class="cta-content"><h2><?= htmlspecialchars($title) ?></h2><p><?= htmlspecialchars($text) ?></p><a class="btn-light-brand" href="<?= $href ?>"><?= htmlspecialchars($button) ?> <i class="bi bi-arrow-right"></i></a></div></div></div></section>
<?php }

function render_home(): void {
  hero("Florida's Robotic Lawn Care Company", "RoboLawn isn't just selling robotic mowers—we're helping build the future of lawn care in Florida.", RL_IMG_BANNER, 'SMARTER LAWN CARE', true); ?>
<main id="page-content">
<section class="section"><div class="container content-grid"><div class="content-copy"><span class="kicker">ROBO LAWN</span><h2>RoboLawn is helping lead the transformation of lawn care through intelligent robotic mowing solutions.</h2><p>We combine industry-leading robotic mowers with professional expertise, local support, and a long-term vision to build Florida's premier robotic lawn care network.</p><p>Whether you're a homeowner looking for a better way to maintain your lawn, a landscape professional seeking to solve labor challenges, or a business interested in joining our growing dealer network, RoboLawn is your trusted partner for robotic mowing.</p><a class="btn-brand" href="contact.php">GET A QUOTE <i class="bi bi-arrow-right"></i></a></div><div class="content-image"><img src="<?= RL_IMG_SLOPE ?>" alt="Robotic mower on a Florida lawn"></div></div></section>
<section class="section section-soft"><div class="container"><div class="section-heading center"><span class="kicker">WHO WE SERVE</span><h2>Robotic mowing solutions for every property</h2></div><div class="overlay-grid">
<?php $cards=[
['Residential Properties','Enjoy a healthier lawn with less work and more free time.','residential-properties.php',RL_IMG_VERTICAL],
['Community Associations','Beautiful communities begin with beautifully maintained common areas.','community-associations.php',RL_IMG_COMPLEX],
['Commercial Properties','Smarter lawn care for the properties you manage.','commercial-properties.php',RL_IMG_LIDAR],
['Landscape Companies','The future of landscaping is helping professionals do more.','landscape-companies.php',RL_IMG_CLIMB]
]; foreach($cards as $card): ?><article class="overlay-card"><img src="<?= $card[3] ?>" alt="<?= $card[0] ?>"><div class="overlay-card-content"><h3><?= $card[0] ?></h3><p><?= $card[1] ?></p><a class="btn-light-brand" href="<?= $card[2] ?>">LEARN MORE <i class="bi bi-arrow-right"></i></a></div></article><?php endforeach; ?>
</div></div></section>
<?php content_section('Dealers', '<p>Join Florida\'s growing robotic lawn care network.</p><p>RoboLawn is building a statewide network of authorized dealers who share our commitment to exceptional customer service and professional support. Dealers receive product training, technical assistance, marketing resources, warranty support, and access to the latest robotic mowing technology.</p><p>Together, we\'re building a trusted local network that will support the future of robotic lawn care across Florida.</p><a class="btn-brand" href="dealers.php">LEARN ABOUT DEALERS <i class="bi bi-arrow-right"></i></a>', RL_IMG_AI, true);
content_section('Why Choose RoboLawn?', '<p>Purchasing a robotic mower is only the beginning. The real value comes from having an experienced local partner who understands the technology and stands behind every installation.</p><ul><li>Professional consultation before you purchase</li><li>Expert installation and property mapping</li><li>Personalized on-site training</li><li>Local warranty and repair support</li><li>Genuine replacement parts</li><li>Annual maintenance programs</li><li>Software updates and technical support</li><li>Experienced local technicians committed to your long-term success</li></ul><p>Our goal isn\'t simply to sell robotic mowers—it\'s to help every customer confidently transition to the future of lawn care.</p>', RL_IMG_SIGNAL);
cta_section('Ready to Explore the Future of Lawn Care?', 'Whether you are looking to automate your own lawn, modernize your landscaping business, or become part of Florida\'s growing RoboLawn dealer network, we are here to help.', 'REQUEST A CONSULTATION', 'contact.php', RL_IMG_BANNER); ?>
</main><?php }

function render_standard(string $key): void {
  $pages = [
    'residential' => [
      'title'=>'A Smarter Way to Care for Your Lawn','intro'=>'Imagine enjoying a beautifully maintained lawn without spending your weekends mowing, hiring a lawn service, or worrying about keeping up with Florida\'s growing season.','hero'=>RL_IMG_VERTICAL,
      'sections'=>[
        ['Why Choose Robotic Mowing?','<p>Unlike traditional lawn mowers that cut large amounts of grass once each week, robotic mowers trim a small amount more frequently. This creates a healthier lawn by naturally returning fine grass clippings to the soil, helping retain moisture and recycle nutrients.</p><p>The result is a lawn that is:</p><ul><li>Greener and healthier</li><li>Consistently maintained</li><li>Free from grass clippings and bagging</li><li>Quietly maintained with virtually no disruption</li><li>Automatically mowed on a schedule you control</li></ul><p>Instead of planning your weekend around mowing, your lawn simply stays maintained.</p>',RL_IMG_SLOPE],
        ['More Than Just Selling a Robotic Mower','<p>Purchasing a robotic mower is only the beginning.</p><p>At RoboLawn, we believe the experience after your purchase is just as important as choosing the right equipment. We take the time to understand your property, answer your questions, recommend the best Mammotion model for your needs, professionally install and configure your mower, and provide the training you need to use it with confidence.</p><p>Our relationship does not end after installation. We are here whenever you need service, maintenance, repairs, software updates, replacement parts, or expert advice.</p>',RL_IMG_PRODUCT],
        ['Professional Installation Makes the Difference','<p>Every property is unique. Trees, landscaping, slopes, driveways, narrow passages, multiple mowing zones, and changing terrain all influence how a robotic mower should be configured.</p><p>Our installation services include:</p><ul><li>Property evaluation</li><li>Professional mower setup</li><li>Property mapping</li><li>Multi-zone configuration</li><li>No-go zone creation</li><li>Performance testing</li><li>Personalized owner training</li></ul><p>We make sure your mower is optimized specifically for your property—not simply removed from a box and turned on.</p>',RL_IMG_LIDAR],
        ['Is Robotic Mowing Right for You?','<p>Robotic mowing is an excellent solution for many residential properties, including:</p><ul><li>Small suburban lawns</li><li>Large residential properties</li><li>Gated communities</li><li>Waterfront homes</li><li>Estate properties</li><li>Properties with multiple mowing areas</li><li>Homes with challenging slopes and terrain</li></ul><p>If you are unsure whether your property is a good candidate, we will evaluate your lawn and recommend the solution that best fits your needs. Sometimes the answer may even be that robotic mowing is not the right choice—and we will tell you that honestly.</p>',RL_IMG_COMPLEX]
      ],
      'cta'=>['Experience the Future of Lawn Care','Our experienced team will guide you through every step—from selecting the right mower to professional installation and long-term support—so you can enjoy robotic mowing with confidence.','READY TO RECLAIM YOUR WEEKENDS?']
    ],
    'landscape' => [
      'title'=>"The Future of Landscaping Isn't Replacing Landscapers—It's Helping Them Do More.",'intro'=>'Landscape companies across Florida are facing the same challenges: finding dependable employees, rising labor costs, increasing competition, and growing customer expectations.','hero'=>RL_IMG_CLIMB,
      'sections'=>[
        ['A New Business Model for Professional Landscapers','<p>Traditional lawn maintenance has changed very little over the past several decades. Companies continue to hire employees to travel from property to property, spending much of their day performing repetitive mowing.</p><p>Robotic mowing changes that model. Instead of spending valuable labor hours mowing every property every week, robotic mowers can maintain the lawn automatically while your team focuses on services that require skilled professionals.</p><ul><li>Improve labor efficiency</li><li>Reduce employee fatigue</li><li>Increase profit per employee</li><li>Expand your customer base without adding the same level of labor</li><li>Differentiate your company from competitors</li><li>Position your business as a technology leader</li><li>Reduce insurance costs</li><li>Reduce expensive equipment and associated maintenance costs</li></ul>',RL_IMG_VERTICAL],
        ['Focus Your Team Where They Add the Most Value','<p>Customers do not hire landscape companies simply because they own a lawn mower. They hire professionals because they want a beautiful property.</p><p>While robotic mowers maintain the turf, your team can spend more time providing services that enhance the appearance and value of the property, including:</p><ul><li>Edging</li><li>Trimming</li><li>Shrub and hedge maintenance</li><li>Landscape improvements</li><li>Irrigation inspections</li><li>Fertilization</li><li>Mulching</li><li>Seasonal cleanups</li><li>Customer service</li></ul>',RL_IMG_OBSTACLE],
        ['Grow Without Growing Your Workforce','<p>One of the greatest challenges facing the landscape industry is finding and retaining qualified employees.</p><p>Robotic mowing provides an opportunity to continue growing your business without relying solely on increasing your workforce. As robotic mowing handles routine grass cutting, your team can manage more properties, deliver additional services, and increase revenue while maintaining the high level of quality your customers expect.</p>',RL_IMG_SIGNAL],
        ['More Than Equipment—A Business Partner','<p>At RoboLawn, we understand that adopting new technology is a business decision. That is why we do more than sell robotic mowers.</p><ul><li>Equipment recommendations</li><li>Property evaluations</li><li>Professional installation</li><li>Staff training</li><li>Ongoing technical support</li><li>Warranty service</li><li>Replacement parts</li><li>Software updates</li><li>Fleet planning guidance</li></ul><p>Our goal is to become your long-term partner as robotic mowing becomes an increasingly important part of the landscape industry.</p>',RL_IMG_AI]
      ],
      'cta'=>['Ready to Explore Robotic Mowing for Your Business?','Whether you are looking to improve efficiency, solve labor challenges, or differentiate your company from the competition, RoboLawn is here to help.','SCHEDULE A LANDSCAPE CONSULTATION']
    ],
    'commercial' => [
      'title'=>'Smarter Lawn Care for the Properties You Manage','intro'=>'First impressions matter. Well-maintained landscaping contributes to property value, enhances curb appeal, and creates a positive experience for residents, employees, and visitors.','hero'=>RL_IMG_COMPLEX,
      'sections'=>[
        ['Designed for a Wide Variety of Commercial Properties','<p>Robotic mowing can be an excellent solution for many types of commercial and institutional properties, including:</p><ul><li>Homeowners Associations and community associations</li><li>Apartment and condominium communities</li><li>Office parks and business campuses</li><li>Municipal buildings</li><li>Schools and universities</li><li>Sports fields</li><li>Churches</li><li>Healthcare facilities</li><li>Industrial parks</li><li>Hotels and resorts</li><li>Large private estates</li><li>Solar panel fields</li></ul><p>Every property is different. RoboLawn will evaluate your site and recommend whether robotic mowing is an appropriate solution for your landscape.</p>',RL_IMG_BANNER],
        ['Consistent Results Every Day','<p>Unlike traditional mowing schedules that may leave grass growing noticeably between visits, robotic mowers maintain the lawn on a regular schedule, producing a consistently well-maintained appearance throughout the growing season.</p><ul><li>A consistently manicured appearance</li><li>More uniform turf growth</li><li>Quiet daily operation</li><li>Less disruption to residents, tenants, employees, and visitors</li><li>A modern approach to landscape maintenance</li></ul>',RL_IMG_PRINT],
        ['Supporting Property Managers and Landscape Contractors','<p>Robotic mowing is not intended to replace professional landscape maintenance. Instead, it becomes another tool that allows landscape professionals to deliver more efficient service while continuing to provide the skilled work that keeps commercial properties looking their best.</p><ul><li>Edging and trimming</li><li>Shrub and hedge maintenance</li><li>Irrigation inspections</li><li>Seasonal cleanups</li><li>Landscape enhancements</li><li>Fertilization</li><li>Property inspections</li></ul>',RL_IMG_OBSTACLE],
        ['Professional Planning, Installation and Long-Term Support','<p>Successful commercial robotic mowing begins with proper planning. Our commercial services include property evaluation, site planning, equipment recommendations, professional installation, property mapping, multi-zone programming, operational testing, staff training, and ongoing support.</p><p>RoboLawn also provides warranty support, repairs, software updates, replacement parts, seasonal maintenance, technical support, and system optimization.</p>',RL_IMG_LIDAR]
      ],
      'cta'=>['Let’s Discuss Your Property','Whether you manage a single commercial property or oversee multiple locations across Florida, RoboLawn can help you evaluate whether robotic mowing is the right fit.','SCHEDULE A COMMERCIAL CONSULTATION']
    ],
    'community' => [
      'title'=>'Smarter Lawn Care for Modern Communities','intro'=>'Homeowners associations, condominium communities, and apartment properties are continually looking for ways to improve curb appeal while controlling long-term maintenance costs.','hero'=>RL_IMG_BANNER,
      'sections'=>[
        ['Lower Long-Term Landscaping Costs','<p>Traditional mowing relies heavily on labor, fuel, and commercial mowing equipment. Robotic mowing helps reduce many of these ongoing expenses while providing a predictable and consistent mowing schedule.</p><ul><li>Reduced labor requirements for repetitive mowing</li><li>Lower fuel consumption</li><li>Reduced maintenance on commercial mowing equipment</li><li>More predictable long-term operating costs</li></ul>',RL_IMG_COMPLEX],
        ['Beautiful Lawns Every Day','<p>Instead of mowing once each week, robotic mowers maintain the lawn continuously.</p><ul><li>A consistently manicured appearance</li><li>No freshly mowed look that fades after a few days</li><li>Improved curb appeal throughout the week</li><li>A more polished appearance for residents and visitors</li></ul>',RL_IMG_VERTICAL],
        ['Quiet, Environmentally Friendly Operation','<p>Because robotic mowers are electric, they operate much more quietly than traditional commercial mowing equipment.</p><ul><li>Reduce noise around homes</li><li>Minimize disruption to residents</li><li>Allow greater flexibility in mowing schedules</li><li>100% electric operation</li><li>No gasoline emissions</li><li>Reduced noise pollution</li><li>Lower overall environmental impact</li></ul>',RL_IMG_SIGNAL],
        ['Safety, Reliability and Landscape Protection','<p>Modern robotic mowers include obstacle detection, lift detection, automatic shutdown when necessary, and weather-resistant operation.</p><p>Because robotic mowers are significantly lighter than commercial mowing equipment, they may help reduce turf damage, soil compaction, accidental landscape damage, and wear in sensitive areas.</p>',RL_IMG_OBSTACLE],
        ['A Smarter Community','<p>Robotic mowing is not simply a new way to cut grass. It demonstrates that your community embraces innovation while improving the experience for residents.</p><ul><li>Forward-thinking</li><li>Environmentally responsible</li><li>Technology-friendly</li><li>Focused on long-term value</li></ul>',RL_IMG_AI]
      ],
      'cta'=>['Is Robotic Mowing Right for Your Community?','Contact RoboLawn to schedule a consultation and explore how robotic mowing could benefit your HOA, condominium, or managed property.','SCHEDULE A CONSULTATION']
    ],
    'dealers' => [
      'title'=>"Join Florida's Growing Robotic Lawnmower Dealer Network",'intro'=>'The robotic lawn care industry is growing rapidly, and customers are looking for knowledgeable local businesses they can trust for sales, installation, service, and long-term support.','hero'=>RL_IMG_AI,
      'sections'=>[
        ['Why RoboLawn Is Building a Dealer Network','<p>RoboLawn is building a network of authorized Mammotion dealers throughout Florida to help bring intelligent robotic mowing solutions to homeowners, commercial property owners, and landscape professionals.</p><p>Customers will expect knowledgeable local professionals who can provide product demonstrations, equipment recommendations, professional installation, training, warranty support, repairs, replacement parts, and ongoing service.</p><p>RoboLawn believes the future of robotic mowing will be built through trusted local businesses supported by a strong statewide distribution network.</p>',RL_IMG_SLOPE],
        ['Why Mammotion?','<p>A successful dealership begins with products you can believe in. After evaluating the rapidly evolving robotic mower market, RoboLawn chose to partner with Mammotion because of its commitment to innovation, product development, and dealer support.</p><ul><li>Industry-leading robotic mowing technology</li><li>Continuous software improvements and feature enhancements</li><li>Advanced navigation technology designed for complex properties</li><li>A product lineup designed for a wide range of applications</li><li>Strong commitment to innovation and future product development</li><li>A growing global brand with increasing market recognition</li></ul>',RL_IMG_LIDAR],
        ['Powered by Mammotion. Supported by RoboLawn.','<p>As your Florida distribution partner, we are committed to helping dealers succeed through product knowledge, technical assistance, training, marketing support, and responsive customer service.</p><p>Our goal is to help you build a successful robotic mowing business by combining Mammotion\'s innovative technology with the local expertise and partnership that only RoboLawn can provide.</p>',RL_IMG_PRODUCT],
        ['Dealer Benefits and Ideal Partners','<p>Authorized RoboLawn dealers may benefit from access to Mammotion robotic mowers, product training, technical support, installation guidance, warranty assistance, marketing resources, sales support, replacement parts access, ongoing product education, and local partnership.</p><p>Ideal dealer partners may include outdoor power equipment dealers, landscape supply companies, landscape contractors, irrigation contractors, pool and outdoor living companies, garden centers, hardware retailers, and businesses serving homeowners and commercial property owners.</p>',RL_IMG_VERTICAL]
      ],
      'cta'=>['Let’s Grow Together','If you are interested in becoming part of Florida\'s expanding RoboLawn dealer network, we would love to learn more about your business.','BECOME A DEALER']
    ],
    'services' => [
      'title'=>'Local Support You Can Count On','intro'=>'Purchasing a robotic mower is just the beginning of your journey. RoboLawn is committed to helping customers enjoy years of reliable performance.','hero'=>RL_IMG_SIGNAL,
      'sections'=>[
        ['Professional Installation','<p>Proper installation is the foundation of a successful robotic mowing experience. Every property is different, and careful setup helps ensure your mower operates safely, efficiently, and reliably from the very beginning.</p><ul><li>Property evaluation</li><li>Mower setup and activation</li><li>Property mapping</li><li>Multi-zone configuration</li><li>No-go zone setup</li><li>Performance testing</li><li>Personalized owner training</li></ul>',RL_IMG_LIDAR],
        ['Ongoing Technical Support','<p>Technology continues to evolve, and questions occasionally arise. Our knowledgeable team is available to assist with:</p><ul><li>App setup</li><li>Software updates</li><li>Configuration assistance</li><li>Operational questions</li><li>Performance optimization</li><li>Troubleshooting</li></ul>',RL_IMG_AI],
        ['Warranty & Repair Services','<p>If your robotic mower ever requires service, RoboLawn is here to help.</p><ul><li>Warranty assistance</li><li>Diagnostic services</li><li>Repair coordination</li><li>Replacement parts</li><li>Performance inspections</li></ul>',RL_IMG_PRODUCT],
        ['Replacement Parts & Accessories','<p>RoboLawn offers genuine replacement components along with knowledgeable guidance to help you select the right products for your equipment.</p><ul><li>Replacement blades</li><li>Blade hardware</li><li>Wheels</li><li>Batteries</li><li>Charging equipment</li><li>Accessories</li><li>Other manufacturer-approved replacement parts</li></ul>',RL_IMG_OBSTACLE]
      ],
      'cta'=>['We’re Here When You Need Us','Whether you need installation, maintenance, troubleshooting, replacement parts, or simply have a question, RoboLawn is ready to help.','REQUEST SERVICE OR SUPPORT']
    ],
    'about' => [
      'title'=>'Building the Future of Lawn Care','intro'=>'Advances in robotic mowing technology are transforming how residential, commercial, and professional landscapes are maintained.','hero'=>RL_IMG_VERTICAL,
      'sections'=>[
        ['Our Story','<p>RoboLawn was founded by two entrepreneurs who share a passion for building businesses based on trust, innovation, and exceptional customer service.</p><p>After decades of serving customers in technology-driven industries, they recognized that robotic mowing represented one of the most significant advancements the lawn care industry has seen in decades.</p><p>While robotic mowing technology was advancing rapidly, many customers still needed knowledgeable local experts they could trust for product selection, installation, training, service, and long-term support. RoboLawn was founded to bridge that gap.</p>',RL_IMG_SLOPE],
        ['More Than Selling Mowers','<p>We believe the future of lawn care requires more than simply selling equipment. It requires education, professional guidance, reliable local support, and a company committed to helping customers succeed long after the initial purchase.</p><p>That is why RoboLawn focuses on building lasting relationships rather than one-time transactions.</p>',RL_IMG_PRODUCT],
        ['Our Mission','<p>To become Florida\'s trusted resource for robotic mowing by providing expert guidance, professional installation, ongoing support, and long-term customer relationships built on trust, quality, and exceptional service.</p>',RL_IMG_LIDAR],
        ['Our Vision','<p>We believe robotic mowing is reshaping the lawn care industry. Our vision is to help accelerate that transformation by building a trusted network that connects homeowners, landscape professionals, commercial property owners, and local dealers through innovative technology and knowledgeable local support.</p>',RL_IMG_AI],
        ['Why Choose RoboLawn?','<p>Technology alone does not create a great customer experience. People do.</p><ul><li>Expert guidance before the sale</li><li>Professional installation and property setup</li><li>Personalized training</li><li>Local service and warranty support</li><li>Replacement parts and technical assistance</li><li>Ongoing support from a company invested in your long-term success</li></ul>',RL_IMG_SIGNAL],
        ['Looking Ahead','<p>Today, we are helping homeowners, businesses, and landscape professionals adopt robotic mowing with confidence. Tomorrow, we see a future where intelligent robotic mowing becomes the standard for lawn care across Florida.</p><p>Our commitment is to continue growing alongside that technology—expanding our expertise, strengthening our dealer network, and providing the local support our customers can rely on for years to come.</p>',RL_IMG_BANNER]
      ],
      'cta'=>['Start a Conversation with RoboLawn','Discover how professional guidance, installation, and long-term local support can help you confidently adopt robotic mowing.','CONTACT ROBOLAWN']
    ]
  ];
  $page=$pages[$key]; hero($page['title'],$page['intro'],$page['hero'],strtoupper(str_replace(['community','landscape'],['COMMUNITIES','LANDSCAPE COMPANIES'],$key))); echo '<main id="page-content">';
  foreach($page['sections'] as $index=>$section){content_section($section[0],$section[1],$section[2],$index%2===1,$index%3===1);} $cta=$page['cta']; cta_section($cta[0],$cta[1],$cta[2],$key==='dealers'?'become-a-dealer.php':'contact.php',$page['hero']); echo '</main>';
}

function product_card(string $discount,string $name,array $specs,string $old,string $sale,string $image): void { ?>
<article class="product-card"><?php if($discount!==''):?><span class="discount-badge"><?= $discount ?></span><?php endif; ?><div class="product-image"><img src="<?= $image ?>" alt="<?= htmlspecialchars($name) ?>" loading="lazy"></div><div class="product-body"><h3><?= htmlspecialchars($name) ?></h3><div class="product-specs"><?php foreach($specs as $spec):?><p><?= htmlspecialchars($spec) ?></p><?php endforeach;?></div><div class="product-price"><?php if($old!==''):?><span class="price-old"><?= $old ?></span><?php endif;?><span class="<?= $old!==''?'price-sale':'' ?>"><?= $sale ?></span></div></div></article>
<?php }

function render_products(): void { hero('Robotic Mowers','RoboLawn offers robotic mowers for a wide variety of residential and commercial applications. We will help you choose the right solution.',RL_IMG_BANNER,'OUR PRODUCT LINE'); ?>
<main id="page-content"><section class="section"><div class="container"><div class="product-intro"><span class="kicker">ROBO LAWN PRODUCTS</span><h2>Sale Dec 11- Jan 18</h2></div><div class="catalog-tabs" role="tablist"><button class="catalog-tab active" type="button" data-catalog-tab="luba" aria-selected="true">LUBA 2</button><button class="catalog-tab" type="button" data-catalog-tab="luba-mini" aria-selected="false">LUBA Mini</button><button class="catalog-tab" type="button" data-catalog-tab="yuka" aria-selected="false">YUKA</button><button class="catalog-tab" type="button" data-catalog-tab="commercial" aria-selected="false">COMMERCIAL</button></div>
<div class="catalog-panel active" data-catalog-panel="luba"><div class="product-grid">
<?php product_card('20% off','LUBA 2 AWD 10000HX',['Climbing Ability 80% (38.6°)','Mowing up to 2.5 acres','Up to 100 custom zones','Cut height 2.2”-4.0'],'$4,499','$3,599',RL_LUBA_PRODUCT); product_card('17% off','LUBA 2 AWD 5000HX',['Climbing Ability 80% (38.6°)','Mowing up to 1.25 acres','Up to 50 custom zones','Cut height 2.2”-4.0'],'$2,999','$2,499',RL_LUBA_PRODUCT); product_card('16% off','LUBA 2 AWD 3000HX',['Climbing Ability 80% (38.6°)','Mowing up to 0.75 acre','Up to 30 custom zones','Cut height 2.2”-4.0'],'$2,599','$2,179',RL_LUBA_PRODUCT); ?>
</div></div>
<div class="catalog-panel" data-catalog-panel="luba-mini"><div class="product-grid">
<?php product_card('','LUBA Mini AWD 1500H',['Coverage up to 0.37 acre','All-wheel drive performance','Multi-zone management','Contact for current availability'],'','CONTACT US',RL_IMG_PRODUCT); product_card('','LUBA Mini AWD 800H',['Coverage for compact lawns','All-wheel drive performance','Smart app control','Contact for current availability'],'','CONTACT US',RL_IMG_PRODUCT); ?>
</div></div>
<div class="catalog-panel" data-catalog-panel="yuka"><div class="product-grid">
<?php product_card('31% off','YUKA AWD 3000',['2-in-1 Self-empty Lawn Sweeper Kit.','Up to .75 acres','Upgraded dual floating cutting disc','for perfect carpet-like lawn.'],'$2,099','$1,449',RL_YUKA_PRODUCT); product_card('27% off','YUKA mini 800H',['Up to 0.4 acre','Climbing ability 50% (27°)','Cut height: 2.0”-3.5”'],'$1,299','$949',RL_YUKA_PRODUCT); product_card('32% off','YUKA mini 600H',['Up to 0.3 acre','Climbing ability 50% (27°)','Cut height: 2.0”-3.5”'],'$1,099','$749',RL_YUKA_PRODUCT); product_card('','YUKA Sweeper Kit',['Self-empty lawn sweeper kit','Designed for compatible YUKA models'],'','$649',RL_YUKA_PRODUCT); ?>
</div></div>
<div class="catalog-panel" data-catalog-panel="commercial"><div class="commercial-coming"><img src="<?= RL_IMG_COMPLEX ?>" alt="Commercial lawn"><div class="commercial-coming-content"><div><span class="kicker">COMMERCIAL</span><h3>COMING SOON</h3><p>Contact RoboLawn to discuss commercial property requirements and future product availability.</p><a class="btn-light-brand" href="contact.php">REQUEST A CONSULTATION <i class="bi bi-arrow-right"></i></a></div></div></div></div>
</div></section><?php cta_section('Need Help Choosing the Right Mower?','For the latest recommendations and availability, contact our team for a personalized consultation.','REQUEST A CONSULTATION','contact.php',RL_IMG_SLOPE); ?></main><?php }

function render_contact(bool $dealer=false): void { $title=$dealer?'Become a RoboLawn Dealer':'Let’s Start the Conversation'; $intro=$dealer?'Tell us about your business and your interest in joining Florida\'s growing robotic lawn care network.':'Whether you are exploring robotic mowing for your home, your business, or your customers, we are here to help.'; hero($title,$intro,$dealer?RL_IMG_AI:RL_IMG_VERTICAL,$dealer?'DEALER NETWORK':'CONTACT ROBOLAWN'); ?>
<main id="page-content"><section class="section"><div class="container content-grid"><div class="content-copy"><h2><?= $dealer?'Let’s Grow Together':'Every Property Is Different' ?></h2><?php if($dealer):?><p>We are looking for businesses that believe robotic mowing represents the future of the landscape industry. Ideal partners value innovation, customer service, technical expertise, and long-term relationships.</p><ul><li>Outdoor power equipment dealers</li><li>Landscape supply companies</li><li>Landscape and irrigation contractors</li><li>Garden centers and hardware retailers</li><li>Businesses serving residential and commercial property owners</li></ul><?php else:?><p>Every customer has unique goals. Our team is happy to answer your questions, discuss your property, recommend the right robotic mowing solution, and explain how RoboLawn can help.</p><p>We believe choosing a robotic mower should begin with a conversation—not just an online shopping cart.</p><div class="contact-cards"><div class="contact-card"><i class="bi bi-telephone"></i><h3>Call</h3><a href="tel:+19414457128">941-445-7128</a></div><div class="contact-card"><i class="bi bi-envelope"></i><h3>Email</h3><a href="mailto:robolawnus@gmail.com">robolawnus@gmail.com</a></div><div class="contact-card"><i class="bi bi-geo-alt"></i><h3>Service Area</h3><p class="mb-0">Florida</p></div></div><?php endif;?></div><div class="form-panel"><h2><?= $dealer?'Dealer Interest Form':'Request a Consultation' ?></h2><form class="site-form needs-validation" data-subject="<?= $dealer?'Become a Dealer':'RoboLawn Website Inquiry' ?>" novalidate><div class="row g-3"><div class="col-md-6"><label class="form-label">Name</label><input class="form-control" name="name" required></div><div class="col-md-6"><label class="form-label">Email</label><input class="form-control" type="email" name="email" required></div><div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" name="phone"></div><div class="col-md-6"><label class="form-label"><?= $dealer?'Business Name':'Property Type' ?></label><input class="form-control" name="<?= $dealer?'business_name':'property_type' ?>"></div><div class="col-12"><label class="form-label">Message</label><textarea class="form-control" name="message" required></textarea></div><div class="col-12"><button class="btn-brand w-100" type="submit">SEND MESSAGE <i class="bi bi-arrow-right"></i></button></div></div></form></div></div></section></main><?php }

function render_pro_tips(): void { hero('Pro Tips','Best tips and practices for the best results.',RL_IMG_BANNER,'ROBOLAWN PRO TIPS'); $tips=[
['Start with a Clean, Well-Defined Lawn','Before your robotic mower begins its routine, take time to edge your lawn and remove any obstacles such as garden hoses, toys, and loose branches. A clean perimeter helps the mower work efficiently and avoid unnecessary stops.'],
['Run Frequent, Short Mowing Cycles','Unlike traditional weekly mowing, robotic mowers perform best when they cut more often but remove less grass each time. Daily or every-other-day schedules keep the lawn consistently manicured.'],
['Keep Blades Sharp and Clean','Dull or clogged blades can lead to uneven cuts and strain the motor. Check blades regularly and replace or clean them as recommended by the manufacturer.'],
['Schedule Around Rain and Irrigation','Most robotic mowers are designed to operate in light rain, but avoiding very wet conditions can extend blade life and improve cut quality.'],
['Check GPS Accuracy Periodically','For GPS-based models, confirm signal strength and base station placement for the most precise navigation.'],
['Clear Debris Regularly','Palm fronds, twigs, or heavy leaf buildup can block the mower or dull blades. A quick walk of the lawn every few days helps keep your mower running smoothly.'],
['Seasonal Maintenance = Long-Term Savings','Plan for two thorough maintenance checks per year—before peak growing season and before winter. This includes cleaning under the deck, checking wheels and sensors, and updating software.'],
['Leverage Smart Scheduling & App Features','Take advantage of your mower’s app to set quiet hours, no-mow zones, or seasonal mowing patterns.'],
['Secure the Charging Station','Place the charging dock in a shaded, stable location with good connectivity, and make sure it is anchored securely.'],
["Don't Forget the Edges",'Robotic mowers handle most of the work—but manual edging, trimming, and blowing every couple of weeks keeps the property looking crisp and professional.']]; ?>
<main id="page-content"><section class="section"><div class="container tip-layout"><div class="tip-images"><img src="<?= RL_IMG_LIDAR ?>" alt="Mapped lawn"><img src="<?= RL_IMG_CLIMB ?>" alt="Mower on slope"><img src="<?= RL_IMG_COMPLEX ?>" alt="Mower in landscaped lawn"></div><div class="tip-content"><h2>Best Tips &amp; Practices for the Best Results</h2><?php foreach($tips as $i=>$tip):?><article class="tip-item"><h3><?= $i+1 ?>. <?= htmlspecialchars($tip[0]) ?></h3><p><?= htmlspecialchars($tip[1]) ?></p></article><?php endforeach;?></div></div></section></main><?php }

function render_videos(): void { hero('See Robotic Mowing in Action','Watch RoboLawn video content for demonstrations, installation guidance, setup, mapping, and intelligent mowing technology.',RL_IMG_VERTICAL,'ROBOLAWN VIDEOS'); $videos=['NzseBlS4Mt8','9spiX1ueGV8','G8YNY18anvk','nKwVC6S0DLk','JJVcG6eHWF8','JJVcG6eHWF8','OXPiD_VCg_k','EzNLeRZF9Rs','myDxXGqOmqc']; ?>
<main id="page-content"><section class="section"><div class="container"><div class="video-grid"><?php foreach($videos as $id):?><a class="video-card" href="https://www.youtube.com/watch?v=<?= $id ?>" target="_blank" rel="noopener"><img src="https://img.youtube.com/vi/<?= $id ?>/hqdefault.jpg" alt="RoboLawn YouTube video" loading="lazy"><span class="video-play"><i class="bi bi-play-fill"></i></span></a><?php endforeach;?></div></div></section></main><?php }

function render_faqs(): void { hero('Frequently Asked Questions','Answers to common questions about Mammotion robotic mowers, installation, operation, maintenance, and support.',RL_IMG_BANNER,'ROBOLAWN FAQ'); $categories=[
'General Product Information'=>[
['What is the difference between the Mammotion LUBA and YUKA models?','LUBA models are designed around all-wheel-drive performance for slopes and complex terrain. YUKA models focus on efficient mowing for smaller and moderate lawns, with selected models supporting lawn sweeping.'],
['What types of lawns and yards are Mammotion products designed for?','The product range supports small residential yards, larger estates, multi-zone properties, slopes, and selected commercial applications. A property evaluation helps determine the right model.'],
['Are Mammotion mowers safe for pets and children?','Modern robotic mowers include obstacle detection and automatic safety responses. Children and pets should still be supervised and kept away from the mower while it operates.'],
['Can Mammotion mowers operate in the rain?','The mowers are weather resistant, but scheduling around heavy rain and saturated turf can improve cut quality and protect the lawn.'],
['How accurate is the GPS navigation system?','With a proper installation, clear positioning signal, and correct mapping, the system is designed for precise route planning and virtual boundaries.']],
'Setup & Installation'=>[
['How do I set up my Mammotion LUBA/YUKA for the first time?','A typical setup includes charging, app pairing, positioning-system setup, mapping the lawn, creating zones, and testing the mowing route. RoboLawn offers professional installation and training.'],
['Do I need to install boundary wires?','Compatible Mammotion models use virtual mapping rather than traditional perimeter wire.'],
['How do I connect the mower to Wi-Fi or Bluetooth?','Use the Mammotion app and follow the device-pairing steps while remaining close to the mower and network.'],
['What tools or accessories come with the mower?','Package contents vary by model. Check the manufacturer package list for the mower, charging equipment, positioning components, blades, and mounting hardware.'],
['How do I install the charging station, and where should I place it?','Choose a stable, level area with access to power and dependable connectivity. Keep the approach path clear.'],
['Can I create different mowing zones or no-go zones?','Yes. Supported models allow mapped mowing zones, channels, boundaries, and no-go areas through the app.']],
'Operation & Use'=>[
['How do I start and stop the mower?','Use the controls on the mower or the Mammotion app after the device has been activated and mapped.'],
['Can I schedule mowing times?','Yes. Schedules can be assigned through the app, including different times for different zones.'],
['How do I adjust mowing height?','Use the model-specific controls or app settings described in the user manual.'],
['Will the mower work on steep slopes?','Slope capability varies by model. LUBA AWD models are designed for demanding slopes and uneven terrain.'],
['Can the mower handle obstacles like trees, flower beds, or playground equipment?','Mapped no-go zones and onboard obstacle detection help the mower navigate around permanent and temporary obstacles.'],
['How long does the battery last on a single charge?','Runtime varies by model, terrain, grass condition, cutting height, and route complexity.'],
['How long does it take to recharge?','Charging time varies by model and battery size. The mower returns to its station automatically when needed.']],
'App & Connectivity'=>[
['Which mobile app do I need to control my mower?','Use the official Mammotion app for compatible mobile devices.'],
['How do I update the software or firmware?','Connect the mower through the app and follow the available firmware update instructions.'],
['Can I use voice assistants like Alexa or Google Assistant?','Feature availability can change by model and software release. Check the current Mammotion app and documentation.'],
['What should I do if the mower loses GPS or connection?','Check positioning-station power, antenna placement, Wi-Fi coverage, app status, and obstructions. Contact RoboLawn if the connection does not recover.']],
'Maintenance'=>[
['How often do I need to replace the blades?','Inspect the blades regularly. Replacement frequency depends on mowing hours, grass conditions, and debris.'],
['How do I clean the mower?','Power the mower off, follow the manufacturer safety instructions, remove loose debris, and clean the underside without damaging electronics or seals.'],
['Can I wash it with a hose?','Follow the exact cleaning and water-resistance guidance for your model. Avoid high-pressure washing.'],
['How do I store the mower during the winter?','Clean the mower, charge and store the battery as instructed, protect the charging equipment, and follow seasonal storage guidance.']],
'Troubleshooting & Common Issues'=>[
["My mower isn't charging—what should I check?",'Confirm the dock is plugged in, indicator lights are normal, contacts are clean, and the mower is correctly aligned.'],
['The mower stops working mid-mow. What should I do?','Check for obstacles, blade blockage, low battery, lost positioning signal, or an app error message.'],
['The mower is missing spots or mowing unevenly. How do I fix this?','Review the map, zone boundaries, route pattern, blade condition, cutting height, and grass conditions.'],
["My mower can't find the charging dock. What should I try?",'Check the mapped return path, dock approach, positioning signal, and objects blocking the station.'],
['What does it mean if the mower shows a GPS error?','A GPS or positioning error usually indicates limited satellite visibility, station configuration, power, antenna placement, or communication issues.'],
["The mower won't connect to Wi-Fi/Bluetooth. How do I fix this?",'Move closer to the device and router, confirm permissions and credentials, restart pairing, and update the app.'],
['What do I do if the mower gets stuck?','Stop the mower safely, remove the obstruction, inspect the area, and adjust the map or no-go zone if the issue may repeat.']],
'Warranty & Support'=>[
['What is the warranty on Mammotion products?','Warranty terms vary by product and purchase channel. Keep proof of purchase and review the manufacturer warranty for the specific model.'],
['Where can I get replacement parts such as blades, wheels, and batteries?','RoboLawn can help identify genuine replacement components and compatible accessories.'],
['Who do I contact for technical support?','Contact RoboLawn at 941-445-7128 or robolawnus@gmail.com.'],
['Are there authorized repair centers?','RoboLawn provides local warranty and repair support for Mammotion robotic mowers.'],
['Can I get extended warranty or protection plans?','Availability depends on the product and current manufacturer programs. Contact RoboLawn for current options.']]
]; ?>
<main id="page-content"><section class="section"><div class="container"><?php $counter=0; foreach($categories as $category=>$questions):?><div class="faq-category"><h2><?= htmlspecialchars($category) ?></h2><div class="accordion" id="faq<?= $counter ?>"><?php foreach($questions as $index=>$qa): $id='faq'.$counter.'-'.$index;?><div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button <?= $index===0?'':'collapsed' ?>" type="button" data-bs-toggle="collapse" data-bs-target="#<?= $id ?>" aria-expanded="<?= $index===0?'true':'false' ?>"><?= htmlspecialchars($qa[0]) ?></button></h3><div id="<?= $id ?>" class="accordion-collapse collapse <?= $index===0?'show':'' ?>" data-bs-parent="#faq<?= $counter ?>"><div class="accordion-body"><?= htmlspecialchars($qa[1]) ?></div></div></div><?php endforeach;?></div></div><?php $counter++; endforeach;?></div></section></main><?php }

function render_page(string $key): void {
  switch($key){
    case 'home':render_home();break;
    case 'products':render_products();break;
    case 'contact':render_contact(false);break;
    case 'become-dealer':render_contact(true);break;
    case 'pro-tips':render_pro_tips();break;
    case 'videos':render_videos();break;
    case 'faqs':render_faqs();break;
    default:render_standard($key);
  }
}
