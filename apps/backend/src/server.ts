import app from "./app";
import { newsletterScheduler } from "./jobs/cronJobs";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the newsletter scheduler
  newsletterScheduler.start();
});
