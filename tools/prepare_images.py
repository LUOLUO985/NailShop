#!/usr/bin/env python3
"""把商品图批量处理成「小程序所有机型都能显示」的 JPEG。

背景：iPhone 默认用「高效」格式拍照，文件是 HEIC。把它改名成 .jpg 并不会转码，
微信小程序的 <image> 只支持 JPG/PNG/SVG/WEBP/GIF，安卓上遇到 HEIC 就显示白块。
本脚本负责：

1. 识别真实格式（不看扩展名，读文件头），HEIC 用 macOS 的 sips 解码；
2. 按 EXIF 方向把图片转正，避免部分安卓机把竖图显示成横图；
3. 转成 sRGB（iPhone 拍的是 Display P3，不转会在安卓上偏色）；
4. 长边压到 MAX_SIZE，去掉 EXIF / GPS 等隐私元数据后另存为 JPEG。

用法：
    python3 tools/prepare_images.py <源目录> <输出目录> [--max-size 1440] [--quality 82]

例：
    python3 tools/prepare_images.py original_assets/cloud_backup original_assets/upload_jpg
"""

import argparse
import io
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageCms, ImageOps

JPEG_MAGIC = b"\xff\xd8\xff"
SOURCE_EXTS = {".jpg", ".jpeg", ".heic", ".heif", ".png", ".webp"}


def real_format(path):
    """返回真实格式：'jpeg' / 'heic' / 'png' / 'webp' / 'unknown'。"""
    with open(path, "rb") as handle:
        head = handle.read(32)
    if head.startswith(JPEG_MAGIC):
        return "jpeg"
    if b"ftypheic" in head or b"ftypheix" in head or b"ftypmif1" in head or b"ftyphevc" in head:
        return "heic"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return "unknown"


def decode_with_sips(src, dst, max_size):
    """用 macOS 自带的 sips 把 HEIC 解成 JPEG（质量 100，后续还会再压一次）。

    注意：sips 在 HEIC -> JPEG 时必须带上 -Z/-z 之类的尺寸参数，否则会写出
    一个只有文件头、没有图像数据的截断文件（体积几 KB，任何解码器都打不开）。
    """
    if not shutil.which("sips"):
        raise RuntimeError("系统里没有 sips，无法解码 HEIC（本脚本需要 macOS）")
    subprocess.run(
        [
            "sips",
            "-s",
            "format",
            "jpeg",
            "-s",
            "formatOptions",
            "100",
            "-Z",
            str(max_size),
            src,
            "--out",
            dst,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )


def convert_to_srgb(image):
    """把带 ICC（例如 Display P3）的图转成 sRGB，避免安卓上偏色。"""
    profile_bytes = image.info.get("icc_profile")
    if not profile_bytes:
        return image.convert("RGB")
    try:
        source = ImageCms.ImageCmsProfile(io.BytesIO(profile_bytes))
        target = ImageCms.createProfile("sRGB")
        converted = ImageCms.profileToProfile(image, source, target, outputMode="RGB")
        return converted if converted else image.convert("RGB")
    except Exception:
        return image.convert("RGB")


def process(src, dst, max_size, quality):
    fmt = real_format(src)
    temp_file = None
    working_path = src

    if fmt in ("heic", "unknown"):
        temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        temp_file.close()
        decode_with_sips(src, temp_file.name, max_size)
        working_path = temp_file.name

    try:
        with Image.open(working_path) as image:
            image = ImageOps.exif_transpose(image)  # 按 EXIF 方向转正，并清掉方向标记
            image = convert_to_srgb(image)

            width, height = image.size
            longest = max(width, height)
            if longest > max_size:
                scale = max_size / float(longest)
                image = image.resize(
                    (max(1, round(width * scale)), max(1, round(height * scale))),
                    Image.LANCZOS,
                )

            # 不传 exif/icc_profile，等于丢掉 GPS、拍摄设备等元数据
            image.save(dst, "JPEG", quality=quality, optimize=True, progressive=False)
            return fmt, image.size
    finally:
        if temp_file and os.path.exists(temp_file.name):
            os.remove(temp_file.name)


def main():
    parser = argparse.ArgumentParser(description="批量把商品图转成小程序可用的 JPEG")
    parser.add_argument("source")
    parser.add_argument("target")
    parser.add_argument("--max-size", type=int, default=1440, help="长边最大像素，默认 1440")
    parser.add_argument("--quality", type=int, default=82, help="JPEG 质量，默认 82")
    args = parser.parse_args()

    os.makedirs(args.target, exist_ok=True)
    names = sorted(
        name
        for name in os.listdir(args.source)
        if os.path.splitext(name)[1].lower() in SOURCE_EXTS
    )
    if not names:
        print("源目录里没有图片文件：%s" % args.source)
        return 1

    ok, failed = 0, []
    for name in names:
        src = os.path.join(args.source, name)
        dst = os.path.join(args.target, os.path.splitext(name)[0] + ".jpg")
        try:
            fmt, size = process(src, dst, args.max_size, args.quality)
            ok += 1
            print(
                "  %-14s %-6s -> %sx%s  %6.0f KB" % (
                    name,
                    fmt,
                    size[0],
                    size[1],
                    os.path.getsize(dst) / 1024.0,
                )
            )
        except Exception as error:  # noqa: BLE001 - 单个文件失败不影响整体
            failed.append(name)
            print("  %-14s 失败：%s" % (name, error))

    print("\n完成 %d 张，失败 %d 张 -> %s" % (ok, len(failed), args.target))
    if failed:
        print("失败文件：" + "、".join(failed))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
