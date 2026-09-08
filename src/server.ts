import { createApp } from './app';

const PORT = process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 LLD Practice Platform Backend running on http://localhost:${PORT}`);
});
