<template>
  <div>
    <div class="row items-center q-mb-xs">
      <div class="col text-subtitle2">{{ label }}</div>
      <q-btn flat dense rounded color="grey-8" icon="refresh" label="پاک کردن" @click="clear"/>
    </div>
    <canvas ref="pad" class="sign-pad"
            @pointerdown="startDraw" @pointermove="draw" @pointerup="endDraw" @pointerleave="endDraw" @pointercancel="endDraw"/>
    <div v-if="error" class="text-negative text-caption">{{ error }}</div>
  </div>
</template>

<script>
/**
 * کادر امضای دیجیتال (قرارداد، فرم پیش‌قرارداد اولیه).
 * isEmpty() برای اعتبارسنجی و toDataURL() برای گرفتن تصویر PNG برش خورده امضا استفاده می‌شود.
 * با اولین خط کشیده شده رویداد ink ارسال می‌شود (برای پاک کردن پیام خطا).
 */
export default {
  name: 'SignaturePad',
  props: {
    label: {type: String, default: 'امضا'},
    error: {type: String, default: ''},
  },
  emits: ['ink'],
  data() {
    return {drawing: false, hasInk: false}
  },
  mounted() {
    this.$nextTick(this.setup)
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    setup() {
      const canvas = this.$refs.pad
      if (!canvas || !canvas.offsetWidth) return false
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      this.padWidth = canvas.offsetWidth
      const ctx = canvas.getContext('2d')
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0d47a1'
      this.ctx = ctx
      this.hasInk = false
      return true
    },
    // اگر عرض کادر عوض شود (مثلاً چرخش گوشی) مقیاس canvas به‌هم می‌ریزد؛ کادر از نو آماده می‌شود
    onResize() {
      const canvas = this.$refs.pad
      if (canvas && this.ctx && canvas.offsetWidth !== this.padWidth) this.setup()
    },
    point(e) {
      const rect = this.$refs.pad.getBoundingClientRect()
      return {x: e.clientX - rect.left, y: e.clientY - rect.top}
    },
    startDraw(e) {
      // در صورت آماده نبودن (مثلاً رندر دیرهنگام) در اولین لمس آماده می‌شود
      if (!this.ctx && !this.setup()) return
      e.preventDefault()
      this.$refs.pad.setPointerCapture(e.pointerId)
      this.drawing = true
      const p = this.point(e)
      this.ctx.beginPath()
      this.ctx.moveTo(p.x, p.y)
    },
    draw(e) {
      if (!this.drawing) return
      e.preventDefault()
      const p = this.point(e)
      this.ctx.lineTo(p.x, p.y)
      this.ctx.stroke()
      if (!this.hasInk) {
        this.hasInk = true
        this.$emit('ink')
      }
    },
    endDraw() {
      this.drawing = false
    },
    isEmpty() {
      return !this.hasInk
    },
    clear() {
      if (!this.ctx) return
      const canvas = this.$refs.pad
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasInk = false
    },
    // فقط محدوده امضا (با کمی حاشیه) ذخیره می‌شود تا در کادر امضا خوانا و بزرگ دیده شود
    toDataURL() {
      const canvas = this.$refs.pad
      const {width, height} = canvas
      const pixels = this.ctx.getImageData(0, 0, width, height).data
      let minX = width, minY = height, maxX = -1, maxY = -1
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] > 0) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      if (maxX < 0) return canvas.toDataURL('image/png')

      const pad = 12 * (window.devicePixelRatio || 1)
      minX = Math.max(minX - pad, 0)
      minY = Math.max(minY - pad, 0)
      maxX = Math.min(maxX + pad, width - 1)
      maxY = Math.min(maxY + pad, height - 1)

      const out = document.createElement('canvas')
      out.width = maxX - minX + 1
      out.height = maxY - minY + 1
      out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
      return out.toDataURL('image/png')
    },
  }
}
</script>

<style scoped>
.sign-pad {
  width: 100%;
  height: 180px;
  border: 2px dashed #90a4ae;
  border-radius: 10px;
  background: #fff;
  touch-action: none;
  cursor: crosshair;
}
</style>
