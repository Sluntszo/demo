# -*- coding: utf-8 -*-
# @Author  : Wenzhuo Ma
# @Time    : 2025/3/19 20:50
# @Function:
from PIL import Image, ImageEnhance

# 打开图片
image = Image.open("../picture/earth.jpg")

# 创建亮度增强对象
enhancer = ImageEnhance.Brightness(image)

# 提高亮度（1.5 表示增加 50%，你可以尝试不同值）
bright_image = enhancer.enhance(1.5)

# 显示调整后的图片
bright_image.show()

# 保存新图片（覆盖原图或另存为新文件）
bright_image.save("../picture/earth_bright.jpg")
