<?php

declare(strict_types=1);

$width = 1200;
$height = 630;
$image = imagecreatetruecolor($width, $height);
imagealphablending($image, true);
imagesavealpha($image, true);

for ($x = 0; $x < $width; $x++) {
    $progress = $x / ($width - 1);
    $red = (int) round(11 + (18 - 11) * $progress);
    $green = (int) round(42 + (63 - 42) * $progress);
    $blue = (int) round(74 + (103 - 74) * $progress);
    $color = imagecolorallocate($image, $red, $green, $blue);
    imageline($image, $x, 0, $x, $height, $color);
}

$circleOne = imagecolorallocatealpha($image, 22, 77, 120, 75);
$circleTwo = imagecolorallocatealpha($image, 11, 95, 120, 105);
imagefilledellipse($image, 1010, 90, 440, 440, $circleOne);
imagefilledellipse($image, 1120, 540, 580, 580, $circleTwo);

$white = imagecolorallocate($image, 255, 255, 255);
$navy = imagecolorallocate($image, 11, 42, 74);
$cyan = imagecolorallocate($image, 188, 236, 243);
$softWhite = imagecolorallocate($image, 226, 237, 245);
$fontBold = 'C:/Windows/Fonts/arialbd.ttf';
$fontRegular = 'C:/Windows/Fonts/arial.ttf';

function filledRoundedRectangle($image, int $left, int $top, int $right, int $bottom, int $radius, int $color): void
{
    imagefilledrectangle($image, $left + $radius, $top, $right - $radius, $bottom, $color);
    imagefilledrectangle($image, $left, $top + $radius, $right, $bottom - $radius, $color);
    imagefilledellipse($image, $left + $radius, $top + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($image, $right - $radius, $top + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($image, $left + $radius, $bottom - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($image, $right - $radius, $bottom - $radius, $radius * 2, $radius * 2, $color);
}

filledRoundedRectangle($image, 96, 104, 190, 198, 22, imagecolorallocatealpha($image, 255, 255, 255, 4));
imagettftext($image, 25, 0, 115, 164, $navy, $fontBold, 'ITP');
imagettftext($image, 64, 0, 96, 300, $white, $fontBold, 'TOEFL ITP');
imagettftext($image, 30, 0, 96, 365, $cyan, $fontBold, 'Practice & Test Portal');
imagettftext($image, 24, 0, 96, 450, $softWhite, $fontRegular, 'Simulasi, ujian terjadwal, dan laporan skor');

$output = __DIR__.'/../public/og-image.png';
if (! imagepng($image, $output, 6)) {
    throw new RuntimeException('Unable to write '.$output);
}

imagedestroy($image);

echo "Generated {$output} ({$width}x{$height})\n";
