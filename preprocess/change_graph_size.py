# -*- coding: utf-8 -*-
# @Author  : Wenzhuo Ma
# @Time    : 2025/4/8 17:24
# @Function: Resize an image to 2:1 aspect ratio

from PIL import Image
import os

try:
    # 打开原图
    print("Trying to open the image...")
    img = Image.open("../picture/kids2.jpg")
    print("Image opened successfully.")

    # 获取原图尺寸
    width, height = img.size
    print(f"Original image size: width={width}, height={height}")

    # 设置新宽高：保持宽度不变，高度设为宽度的一半（即2:1比例）
    new_width = width
    new_height = width // 2
    print(f"Resizing image to: width={new_width}, height={new_height}")

    # 拉伸图像到新尺寸
    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    print("Image resized.")

    # 保存拉伸后的图像
    output_path = "../picture/output2.jpg"
    resized_img.save(output_path)
    print(f"Image saved as '{output_path}'.")

    # 检查是否真的保存了
    if os.path.exists(output_path):
        print("✅ Image file saved successfully.")
    else:
        print("❌ Failed to save image.")

except Exception as e:
    print(f"An error occurred: {e}")
