<script setup>
import { computed, ref, watch } from 'vue'

const base = import.meta.env.BASE_URL

const props = defineProps({
  // State type: 'white-to-move', 'black-to-move', 'correct', 'incorrect', or custom header
  state: { type: String, default: '' },
  // Header text (can be auto-generated from state or custom)
  headerText: { type: String, default: '' },
  // Move notation for correct/incorrect states (e.g., "e4", "Rxd6")
  moveNotation: { type: String, default: '' },
  // Custom message
  message: { type: String, default: '' },
  // Show the tip pointing to avatar
  showTip: { type: Boolean, default: true },
  // Control fade in/out animation visibility
  visible: { type: Boolean, default: true },
})

const emit = defineEmits(['after-leave'])

// Compute the header title based on state
const displayHeaderText = computed(() => {
  if (props.headerText) return props.headerText
  
  switch (props.state) {
    case 'white-to-move':
      return 'White to move'
    case 'black-to-move':
      return 'Black to move'
    case 'correct':
      return props.moveNotation ? `${props.moveNotation} is correct` : 'Correct!'
    case 'incorrect':
      return props.moveNotation ? `${props.moveNotation} is incorrect` : 'Incorrect'
    default:
      return ''
  }
})

// Determine if we should show an icon/indicator based on state
const showStateIndicator = computed(() => {
  return ['white-to-move', 'black-to-move', 'correct', 'incorrect'].includes(props.state)
})

const tipSrc = `${base}icons/misc/bubble-tip.svg`

// Ref for measuring bubble element
const bubbleRef = ref(null)

// Preserve wrapper height when bubble hides to prevent layout shift
const preservedHeight = ref(null)

watch(() => props.visible, (newVal, oldVal) => {
  if (!newVal && oldVal && bubbleRef.value) {
    const currentHeight = bubbleRef.value.offsetHeight
    preservedHeight.value = Math.max(currentHeight, preservedHeight.value || 0)
  }
})

function onAfterLeave() {
  emit('after-leave')
}
</script>

<template>
  <div class="coach-container">
    <!-- Coach Avatar -->
    <div class="coach-avatar">
      <svg class="coach-avatar-svg" width="96" height="96" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Coach Sloane" role="img">
        <g clip-path="url(#clip0_2236_3661)">
          <mask id="mask0_2236_3661" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="90" height="90">
            <path d="M90 0H0V90H90V0Z" fill="white"/>
          </mask>
          <g mask="url(#mask0_2236_3661)">
            <path d="M75.0052 55.9174C76.4765 44.0139 70.1296 44.3661 68.7835 29.833C67.8835 20.1209 64.1348 11.3165 56.9504 11.3087C55.2835 9.75912 53.2409 3.18521 43.5522 4.58608C23.3765 8.08434 21.5687 23.9009 21.5687 23.9009C21.5687 23.9009 21.4983 27.4226 20.9426 29.1052C18.767 43.5913 13.9617 44.5226 16.6696 55.0252C19.2522 65.0661 13.3983 65.1365 16.7087 77.1965C19.6278 87.84 71.8591 87.4487 75.1696 75.3887C78.48 63.3287 73.98 64.3069 75.013 55.9174H75.0052Z" fill="#DB5F3E"/>
            <path d="M72.4148 54.3287C75.0209 43.8339 69.9652 44.9452 67.86 30.5139C66.6313 21.6469 63.8765 11.3165 56.9583 11.3009C54.1722 9.65738 53.6948 4.39825 44.3504 5.79912C24.8948 9.29738 22.4374 25.2548 22.4374 25.2548C22.4374 25.2548 22.367 28.7765 21.8348 30.4591C19.7374 44.9452 15.1044 45.8765 17.7104 56.3791C20.1991 66.42 12.7644 65.653 15.9496 77.7209C18.767 88.3643 69.5974 85.7191 72.7904 73.6513C75.9835 61.5913 69.9261 64.3617 72.4148 54.3209V54.3287Z" fill="#B34527"/>
            <path d="M63.7748 59.4626C67.2965 49.2417 61.0983 50.3765 61.693 35.8044C61.693 35.7104 61.7009 35.6165 61.7087 35.5226L46.44 32.6583L36.3913 86.1809C49.8678 88.0983 62.1391 87.6678 64.4009 82.9017C69.7617 71.64 60.2139 69.793 63.7748 59.4626Z" fill="#982A0B"/>
            <path d="M27.227 60.3548C23.7052 50.1339 26.2722 40.5939 30.6548 35.8122C30.7174 35.7417 30.647 35.6243 30.6391 35.5304L45.9078 32.6661L55.9565 86.1887C42.48 88.1061 30.2087 87.6756 27.947 82.9096C22.5861 71.6478 26.6087 63.2348 27.227 60.3548Z" fill="#982A0B"/>
            <path d="M58.8522 40.2104C63.6731 43.02 62.9609 32.3295 65.4496 33.5974C67.6096 36.5008 64.9409 50.5095 59.1261 45.18C56.2305 41.713 54.1331 42.1122 54.1331 42.1122C54.1331 42.1122 56.8644 39.0443 58.8522 40.2182V40.2104Z" fill="#D18B54"/>
            <path d="M31.0617 40.2104C26.2409 43.02 26.9531 32.3295 24.4644 33.5974C22.3044 36.5008 24.973 50.5095 30.7878 45.18C33.6835 41.713 35.7809 42.1122 35.7809 42.1122C35.7809 42.1122 33.0496 39.0443 31.0617 40.2182V40.2104Z" fill="#D18B54"/>
            <path d="M84.3809 91.5104C82.9174 84.373 80.7026 74.1052 77.1104 72.5322C75.4904 72.1096 61.7087 68.0635 61.7087 68.0635C55.4009 66.013 53.0765 61.067 53.7574 54.1252H36.0548C36.7513 61.1374 34.3644 66.0835 27.9704 68.1183C27.9704 68.087 14.3609 72.1017 12.7017 72.54C11.8017 72.7748 10.8783 73.5261 9.95479 74.7704C8.01392 77.4156 6.45653 85.6409 5.31392 91.5183H84.3809V91.5104Z" fill="#E7AB75"/>
            <path d="M45.1957 64.1582C48.9678 64.1582 50.5252 62.9061 52.7322 60.8087C53.1313 60.433 53.4835 59.8148 53.8513 59.4782C53.6557 57.9522 53.6713 56.5591 53.8513 54.7826H36.0861C36.2739 56.6452 36.0861 57.8974 35.8591 59.4782C36.1487 59.7522 36.8765 60.5113 37.1896 60.8087C39.3261 62.8356 41.4313 64.1582 45.2035 64.1582H45.1957Z" fill="#D18B54"/>
            <path d="M84.1226 92.1209C82.7922 83.9035 80.8356 73.847 77.4704 72.0548C74.0348 71.1313 64.8626 69.9183 58.1165 65.2774C57.06 64.5496 55.6513 65.4183 55.8313 66.6861C56.8956 74.3478 57.6861 90.7826 44.8043 90.7826C31.9226 90.7826 32.7443 74.4261 33.84 67.1478C34.02 65.9661 32.7835 65.0817 31.7191 65.6217C26.4835 68.3139 16.2939 71.053 12.733 72.0235C8.84348 73.4791 7.08261 83.5904 5.84608 92.113H84.1383L84.1226 92.1209Z" fill="#F6E6DA"/>
            <path d="M33.1122 63.9078L34.2469 92.1052H31.3043C31.3043 92.1052 31.2496 66.4122 33.1122 63.9078Z" fill="#E3C29C"/>
            <path d="M56.8565 64.5104L55.3774 92.113H58.32C58.32 92.113 58.7191 67.0148 56.8565 64.5104Z" fill="#E3C29C"/>
            <path d="M59.0478 22.7974C59.0478 22.7974 57.0757 14.9948 44.953 15.4565C32.8304 14.9948 30.8583 22.7974 30.8583 22.7974C30.8583 22.7974 28.4087 31.9617 27.9939 36.4304C28.0878 38.7 28.2835 39.6626 28.8861 42.5974C30.7017 52.6539 32.9948 54.0391 37.4948 58.3122C39.5374 60.253 41.5643 61.5287 45.18 61.5287C48.7957 61.5287 50.2904 60.3313 52.4113 58.3122C56.9113 54.0391 59.2043 52.6617 61.02 42.5974C61.6226 39.6626 61.8183 38.7 61.9122 36.4304C61.4974 31.9696 59.0478 22.7974 59.0478 22.7974Z" fill="#EEB787"/>
            <path d="M39.4748 51.0104C40.8678 53.1391 42.5113 54.9 44.9061 54.8452C47.2383 54.8765 49.0148 53.1548 50.447 51.0104H39.4748Z" fill="#E7AB75"/>
            <path d="M49.3983 43.6226C49.7504 44.3817 49.1556 45.2739 48.3496 45.3835C47.9739 45.4461 47.5904 45.4539 47.2148 45.4069C46.98 45.36 46.7374 45.36 46.5183 45.4695C46.3304 45.5635 46.1661 45.72 45.9939 45.8452C45.5713 46.1426 45.0156 46.2287 44.5226 46.0878C44.1 45.9782 43.7713 45.6574 43.3956 45.4617C43.1765 45.3522 42.9339 45.3521 42.6991 45.3991C42.073 45.4539 41.3217 45.4774 40.8365 45.0156C40.453 44.6713 40.3043 44.0687 40.5156 43.6069C40.5156 43.7243 40.5 43.8417 40.5235 43.9591C40.5861 44.3817 40.9069 44.7574 41.3139 44.8669C41.7835 44.9765 42.3 44.8826 42.7696 44.7808C43.2626 44.6635 43.7556 44.8748 44.1626 45.1408C44.3348 45.2426 44.5069 45.3678 44.7026 45.4148C45.0078 45.493 45.3443 45.4461 45.6104 45.2739C45.7591 45.1721 45.8922 45.0626 46.0565 44.9687C46.3774 44.773 46.7687 44.7104 47.1365 44.7887C47.6061 44.8904 48.1148 44.9843 48.5922 44.8748C49.1243 44.7261 49.4687 44.1548 49.3983 43.6148V43.6226Z" fill="#D5875A"/>
            <path d="M51.9026 49.5861C52.0435 49.3904 51.9026 49.1243 51.6678 49.1165C50.0869 49.0852 47.7548 48.2243 46.6435 48.2243C45.72 48.2243 45.1878 48.5843 44.9687 48.7722C44.7496 48.5765 44.2174 48.2243 43.2939 48.2243C42.1748 48.2243 39.8426 49.0852 38.2617 49.1165C38.0191 49.1165 37.8861 49.3904 38.027 49.5861C39.2009 51.2374 41.3922 53.7339 44.9217 53.7339C48.4513 53.7339 50.7287 51.2374 51.9183 49.5861H51.9026Z" fill="#DF7A65"/>
            <path d="M47.1443 35.5383C47.1443 38.6922 54.6339 38.4496 56.4652 37.5261C56.4965 37.5261 60.073 35.2409 60.073 32.087C60.073 28.933 56.1052 29.0035 55.307 28.8235C53.6948 28.4556 49.3983 30.2635 48.5296 31.6252C47.9974 32.2748 47.1443 34.4739 47.1365 35.5304L47.1443 35.5383Z" fill="url(#paint0_linear_2236_3661)"/>
            <path d="M54.4539 28.5496C53.5226 28.8783 52.0513 29.1913 50.9635 29.3948L50.1026 30.8583L50.3217 29.5122C50.2513 29.5278 50.1809 29.5357 50.1183 29.5513C49.7583 29.6139 49.453 29.8487 49.273 30.1852L48.1304 32.3296L53.4365 31.3122C56.1756 30.0913 58.273 30.4826 59.4313 30.9209C59.6896 31.0226 59.893 30.6861 59.713 30.4748C57.9757 28.487 55.8704 28.0565 54.4539 28.5496Z" fill="#CD7C61"/>
            <path d="M48.8035 35.867C48.8035 35.867 51.6991 32.4157 56.4026 35.3817C56.4026 35.3817 53.6478 38.8565 48.8035 35.867Z" fill="white"/>
            <mask id="mask1_2236_3661" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="48" y="34" width="9" height="4">
              <path d="M48.8035 35.867C48.8035 35.867 51.6991 32.4157 56.4026 35.3817C56.4026 35.3817 53.6478 38.8565 48.8035 35.867Z" fill="white"/>
            </mask>
            <g mask="url(#mask1_2236_3661)">
              <path d="M52.7948 37.1035C53.8148 37.1035 54.6417 36.2766 54.6417 35.2565C54.6417 34.2365 53.8148 33.4096 52.7948 33.4096C51.7747 33.4096 50.9478 34.2365 50.9478 35.2565C50.9478 36.2766 51.7747 37.1035 52.7948 37.1035Z" fill="#AD604C"/>
            </g>
            <path d="M49.6565 35.1548C50.1965 34.6852 50.7678 34.3017 51.3704 33.9261C51.4643 33.8713 51.5583 33.8165 51.6522 33.7696C52.1452 33.5191 52.7165 33.4096 53.2722 33.4174C54.2113 33.4174 55.1504 33.5896 56.0191 33.9496C56.0817 33.973 56.207 34.0356 56.2696 34.0591C57.0287 34.4426 57.8896 34.5678 58.7504 34.5287C57.8583 35.1626 56.7313 35.1861 55.7061 34.8652C54.9861 34.6852 54.2504 34.5678 53.5148 34.4974C52.9904 34.4426 52.4739 34.4191 51.9574 34.56C51.1826 34.7869 50.4626 35.0296 49.6565 35.1391V35.1548Z" fill="#7B3330"/>
            <path d="M53.773 36.313C54.1534 36.313 54.4617 36.0047 54.4617 35.6243C54.4617 35.244 54.1534 34.9356 53.773 34.9356C53.3927 34.9356 53.0844 35.244 53.0844 35.6243C53.0844 36.0047 53.3927 36.313 53.773 36.313Z" fill="white"/>
            <path d="M42.7774 35.5383C42.7774 38.6922 35.2878 38.4496 33.4565 37.5261C33.4252 37.5261 29.8487 35.2409 29.8487 32.087C29.8487 28.933 33.8165 29.0035 34.6148 28.8235C36.227 28.4556 40.5235 30.2635 41.3922 31.6252C41.9243 32.2748 42.7774 34.4739 42.7852 35.5304L42.7774 35.5383Z" fill="url(#paint1_linear_2236_3661)"/>
            <path d="M35.46 28.5496C36.3913 28.8783 39.5922 29.5122 39.5922 29.5122C39.6626 29.5278 39.733 29.5357 39.7957 29.5513C40.1557 29.6139 40.4609 29.8487 40.6409 30.1852L41.7835 32.3296L36.4774 31.3122C33.7383 30.0913 31.6409 30.4826 30.4826 30.9209C30.2244 31.0226 30.0209 30.6861 30.2009 30.4748C31.9383 28.487 34.0435 28.0565 35.46 28.5496Z" fill="#CD7C61"/>
            <path d="M41.1104 35.867C41.1104 35.867 38.2148 32.4157 33.5113 35.3817C33.5113 35.3817 36.2661 38.8565 41.1104 35.867Z" fill="white"/>
            <mask id="mask2_2236_3661" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="33" y="34" width="9" height="4">
              <path d="M41.1104 35.867C41.1104 35.867 38.2148 32.4157 33.5113 35.3817C33.5113 35.3817 36.2661 38.8565 41.1104 35.867Z" fill="white"/>
            </mask>
            <g mask="url(#mask2_2236_3661)">
              <path d="M37.127 37.1035C38.147 37.1035 38.9739 36.2766 38.9739 35.2565C38.9739 34.2365 38.147 33.4096 37.127 33.4096C36.1069 33.4096 35.28 34.2365 35.28 35.2565C35.28 36.2766 36.1069 37.1035 37.127 37.1035Z" fill="#AD604C"/>
            </g>
            <path d="M40.2574 35.1548C39.5296 35.0452 38.8409 34.8496 38.1444 34.6226C38.1052 34.6148 37.9957 34.5835 37.9565 34.5678C37.44 34.427 36.9235 34.4504 36.3991 34.5052C35.6557 34.5678 34.9278 34.6931 34.2078 34.8731C33.1826 35.2017 32.0557 35.1704 31.1635 34.5365C32.0165 34.5757 32.8852 34.4504 33.6444 34.067C33.707 34.0435 33.8322 33.9809 33.8948 33.9574C34.7635 33.5974 35.7026 33.4174 36.6417 33.4252C37.1974 33.4174 37.7687 33.527 38.2617 33.7774C38.3557 33.8244 38.4574 33.8791 38.5435 33.9339C39.1461 34.3096 39.7174 34.6931 40.2574 35.1626V35.1548Z" fill="#7B3330"/>
            <path d="M38.1365 36.3131C38.5169 36.3131 38.8252 36.0047 38.8252 35.6244C38.8252 35.244 38.5169 34.9357 38.1365 34.9357C37.7562 34.9357 37.4478 35.244 37.4478 35.6244C37.4478 36.0047 37.7562 36.3131 38.1365 36.3131Z" fill="white"/>
            <path opacity="0.2" d="M45.8922 42.2061V34.7243H44.0217V42.2061C43.5835 42.3391 43.2939 42.5661 43.2939 42.8243C43.2939 43.2391 44.0374 43.5756 44.953 43.5756C45.8687 43.5756 46.6122 43.2391 46.6122 42.8243C46.6122 42.5661 46.3226 42.3391 45.8844 42.2061H45.8922Z" fill="url(#paint2_linear_2236_3661)"/>
            <path d="M68.8539 58.6409L71.8278 59.4626C72.3209 55.9252 74.9348 51.12 72.5948 46.3774C69.0183 39.1069 64.3304 27.2035 64.3304 24.0887C63.5635 13.6643 53.6009 16.3487 53.6009 16.3487C53.6009 16.3487 59.4939 17.3191 60.4878 24.4017C61.4896 31.5 62.8278 39.6939 66.193 45.1956C69.3391 50.353 69.8791 55.4009 68.8461 58.633L68.8539 58.6409Z" fill="#B34527"/>
            <path d="M51.6522 17.5148L54.4617 14.5565L52.7557 17.9061L51.6522 17.5148Z" fill="#EEB787"/>
            <path d="M58.8913 66.2635L59.4235 64.6513L78.8009 71.7965C80.4678 72.407 81.7513 73.6904 82.3148 75.287L88.5678 93.1696H62.4444L58.8913 66.2557V66.2635Z" fill="#4D555F"/>
            <path d="M57.3104 66.2322L57.8426 64.62L77.22 71.7652C78.887 72.3756 80.1704 73.6591 80.7339 75.2557L86.987 93.1383H60.8635L57.3104 66.2243V66.2322Z" fill="#34383F"/>
            <path d="M31.1087 66.2635L30.5765 64.6513L11.1991 71.7965C9.53218 72.4069 8.2487 73.6904 7.68522 75.2869L1.43217 93.1696H27.5557L31.1087 66.2556V66.2635Z" fill="#4D555F"/>
            <path d="M32.4391 66.2322L31.907 64.62L12.5296 71.7652C10.8626 72.3756 9.57913 73.6591 9.01565 75.2557L2.7626 93.1383H28.8861L32.4391 66.2243V66.2322Z" fill="#34383F"/>
            <path d="M64.6044 93.9052L67.7035 81.3756C67.7191 81.1017 67.6096 80.8356 67.4061 80.6635L63.0783 77.4939L65.7548 76.273C66.1226 76.1087 66.3261 75.6939 66.2322 75.2948L64.5574 67.8209L57.4435 63.2113L55.7687 66.8113L58.5157 93.9052H64.6044Z" fill="#1E2533"/>
            <path d="M57.2322 62.6087L64.9644 66.2556L66.6391 73.3461C66.7644 73.8704 66.4983 74.4183 65.9974 74.6374L63.5087 75.7409L66.9991 78.5817C67.2809 78.8087 67.4374 79.1609 67.4139 79.5287L64.2835 93.9052H59.0557L57.24 62.6087H57.2322Z" fill="#515964"/>
            <path d="M56.113 61.8809L63.4461 66.2635L65.1209 73.3539C65.2461 73.8783 64.98 74.4261 64.4791 74.6452L61.9904 75.7487L65.4809 78.5896C65.7626 78.8165 65.9191 79.1687 65.8957 79.5365L64.2757 93.913H57.5452L55.1348 62.6165C55.0957 62.0765 55.6278 61.6852 56.1287 61.873L56.113 61.8809Z" fill="#3C4249"/>
            <path d="M25.3174 93.9052L22.2183 81.3756C22.2026 81.1017 22.3122 80.8356 22.5156 80.6635L26.8435 77.4939L24.167 76.273C23.7991 76.1087 23.5956 75.6939 23.6896 75.2948L25.3643 67.8209L32.4783 63.2113L34.153 66.8113L31.4061 93.9052H25.3174Z" fill="#1E2533"/>
            <path d="M32.6896 62.6087L24.9574 66.2556L23.2826 73.3461C23.1574 73.8704 23.4235 74.4183 23.9243 74.6374L26.413 75.7409L22.9226 78.5817C22.6409 78.8087 22.4843 79.1609 22.5078 79.5287L25.6383 93.9052H30.8661L32.6817 62.6087H32.6896Z" fill="#515964"/>
            <path d="M33.8087 61.8809L26.4757 66.2635L24.8009 73.3539C24.6757 73.8783 24.9417 74.4261 25.4426 74.6452L27.9313 75.7487L24.4409 78.5896C24.1591 78.8165 24.0026 79.1687 24.0261 79.5365L25.6461 93.913H32.3765L34.787 62.6165C34.8261 62.0765 34.2939 61.6852 33.793 61.873L33.8087 61.8809Z" fill="#3C4249"/>
            <path d="M46.5339 8.99216C41.4783 8.36607 33.8556 8.9139 28.6435 17.9374C23.4313 26.9609 16.5287 31.0304 17.1783 34.7556C17.8278 38.4809 22.4843 49.3435 18.133 53.7182C13.7817 58.093 11.5513 60.073 13.0539 64.6043C13.2652 65.2539 15.8557 66.8504 13.9539 70.7869C14.5096 70.6774 18.6339 70.4035 19.2522 70.1687C24.5035 68.1887 30.8191 64.7061 28.4087 55.7609C25.9983 46.8156 26.28 43.8574 30.3417 38.8722C34.4035 33.8869 38.8722 25.02 40.2965 17.4756C40.2965 17.4756 41.7913 14.3452 45.673 15.6835L52.4661 16.4739C52.4661 16.4739 51.5974 9.61824 46.5417 8.99216H46.5339Z" fill="#B34527"/>
            <path d="M13.9539 70.787C14.7365 70.0043 16.607 68.9713 15.4643 66.4435C13.4843 62.0922 15.4957 59.8852 19.3617 55.08C21.2791 52.693 20.8252 48.96 19.753 45.3522C20.2148 48.6235 20.0426 51.8009 18.133 53.7183C13.7817 58.093 11.5513 60.073 13.0539 64.6043C14.5565 69.1357 14.9713 68.04 13.9617 70.787H13.9539Z" fill="#DB5F3E"/>
            <path d="M46.5887 8.99216C41.533 8.36607 33.9104 8.9139 28.6983 17.9374C23.4861 26.9609 16.5835 31.0304 17.233 34.7556C17.3974 35.7026 17.82 37.1113 18.2896 38.7626C15.4956 27.4304 38.9191 25.02 40.3435 17.4756C40.3435 17.4756 41.8383 14.3452 45.72 15.6835L52.513 16.4739C52.513 16.4739 51.6443 9.61824 46.5887 8.99216Z" fill="#DB5F3E"/>
            <path d="M45.1878 16.9278L49.8522 16.1687C49.8522 16.1687 48.1461 11.8722 44.8826 12.6469C41.627 13.4217 40.5 14.76 39.8504 19.1504C39.9835 18.5869 40.1087 18.0235 40.2104 17.4678C40.2104 17.4678 41.7757 15.3156 45.18 16.92L45.1878 16.9278Z" fill="#B34527"/>
            <path d="M28.4165 55.7452C28.4165 55.7452 34.3565 77.4939 13.9539 70.7869L28.4165 55.7452Z" fill="#B34527"/>
            <path d="M20.7156 42.2217C20.7156 42.2217 18.5009 32.76 26.593 29.1052C26.593 29.1052 22.1009 35.6635 20.7156 42.2217Z" fill="#DB5F3E"/>
            <path d="M70.8026 52.1452C70.8026 52.1452 65.6061 57.4435 68.353 62.233C71.0922 67.0148 71.1548 68.4156 71.1548 68.4156C71.1548 68.4156 71.7417 64.9252 70.3409 61.5443C68.94 58.1635 70.8104 52.1452 70.8104 52.1452H70.8026Z" fill="#DB5F3E"/>
          </g>
        </g>
        <defs>
          <linearGradient id="paint0_linear_2236_3661" x1="54.227" y1="34.8887" x2="50.7991" y2="28.1191" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEB787"/>
            <stop offset="1" stop-color="#D18B54"/>
          </linearGradient>
          <linearGradient id="paint1_linear_2236_3661" x1="36.4617" y1="33.3548" x2="38.7939" y2="28.3774" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEB787"/>
            <stop offset="1" stop-color="#D18B54"/>
          </linearGradient>
          <linearGradient id="paint2_linear_2236_3661" x1="44.9609" y1="43.3096" x2="44.9609" y2="35.6009" gradientUnits="userSpaceOnUse">
            <stop stop-color="white"/>
            <stop offset="0.16" stop-color="#FEF4ED"/>
            <stop offset="1" stop-color="#FBC092"/>
          </linearGradient>
          <clipPath id="clip0_2236_3661">
            <rect width="90" height="90" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
    
    <!-- Bubble wrapper maintains space even when bubble is hidden -->
    <div class="bubble-wrapper" :style="preservedHeight ? { minHeight: preservedHeight + 'px' } : {}">
      <Transition name="bubble" @after-leave="onAfterLeave">
        <!-- Speech Bubble -->
        <div v-if="visible" ref="bubbleRef" class="bubble">
          <!-- Tip pointing to avatar -->
          <div v-if="showTip" class="tip">
            <img :src="tipSrc" alt="" />
          </div>
          
          <div class="bubble-content">
            <!-- Header with state indicator -->
            <div v-if="showStateIndicator || displayHeaderText" class="bubble-header">
              <div class="classification">
                <!-- White to move: white square with gray border -->
                <div v-if="state === 'white-to-move'" class="color-indicator white-indicator"></div>
                
                <!-- Black to move: black square with gray border -->
                <div v-if="state === 'black-to-move'" class="color-indicator black-indicator"></div>
                
                <!-- Correct: green checkmark circle -->
                <svg v-if="state === 'correct'" class="state-icon correct-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#81B64C"/>
                  <path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                
                <!-- Incorrect: red X circle -->
                <svg v-if="state === 'incorrect'" class="state-icon incorrect-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#E02828"/>
                  <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                
                <span class="classification-text">{{ displayHeaderText }}</span>
              </div>
            </div>
            
            <!-- Coach message -->
            <p v-if="message" class="coach-message">{{ message }}</p>
            
            <!-- Fallback for empty -->
            <p v-if="!showStateIndicator && !displayHeaderText && !message" class="empty">No message</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.coach-container {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0;
  width: 100%;
  min-height: 128px;
}

.coach-avatar {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 5px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coach-avatar-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Wrapper maintains space when bubble is hidden */
.bubble-wrapper {
  position: relative;
  flex: 1;
  margin-left: -6px;
  display: flex;
  align-items: flex-end;
}

.bubble {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
}

/* Bubble transition animations */
.bubble-enter-active,
.bubble-leave-active {
  transition:
    opacity var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1)),
    transform var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1));
}

.bubble-enter-from {
  opacity: 0;
  transform: translateX(-2rem);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.bubble-leave-to {
  opacity: 0;
  transform: none;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .bubble-enter-active,
  .bubble-leave-active {
    transition: opacity var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1));
  }

  .bubble-enter-from,
  .bubble-enter-to,
  .bubble-leave-from,
  .bubble-leave-to {
    transform: none;
  }
}

.tip {
  position: absolute;
  left: -13px;
  bottom: 20px;
  width: 14px;
  height: 22px;
  z-index: 1;
}

.tip img {
  width: 100%;
  height: 100%;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  min-height: 64px;
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.classification {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

/* Color indicator squares (White/Black to move) */
.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 2px solid #8b8987;
  flex-shrink: 0;
}

.white-indicator {
  background: white;
}

.black-indicator {
  background: black;
}

/* State icons (Correct/Incorrect) */
.state-icon {
  flex-shrink: 0;
}

.correct-icon {
  color: #81B64C;
}

.incorrect-icon {
  color: #E02828;
}

.classification-text {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.coach-message {
  margin: 0;
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: #312e2b;
}

.empty {
  margin: 0;
  color: #9a9a9a;
  font-size: 14px;
}
</style>
