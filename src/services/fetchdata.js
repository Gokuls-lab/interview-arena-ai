import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://prjqjitgfunnwqacnkew.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByanFqaXRnZnVubndxYWNua2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxODY3MzIsImV4cCI6MjA1OTc2MjczMn0.bKE7JWxj5RKShoMyyFI3qt6thdTTURMjQhC5P2mUGSA');

const tableName = 'jobs';

// async function fetchData() {
//   const { data, error } = await supabase.from(tableName).select('*');

//   if (error) {
//     console.error('Error fetching data:', error);
//     return;
//   }

//   console.log('Fetched data:', data);
// }
const Data={
    fetchJobData:async () => {
        const { data, error } = await supabase.from(tableName).select('*');
      
        if (error) {
          console.error('Error fetching data:', error);
          return;
        }
      
        // console.log('Fetched data:', data);
        return data;
      }
}
// fetchData();
export default Data;