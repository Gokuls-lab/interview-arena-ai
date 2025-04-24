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
      },

      fetchInterviewResult:async () => {
        const { data, error } = await supabase.from("interview").select('*');
      
        if (error) {
          console.error('Error fetching data:', error);
          return;
        }
      
        // console.log('Fetched data:', data);
        return data;
      },
      fetchusers: async (id) => {
        const { data, error } = await supabase
          .from("profiles")
          .select('*')
          .eq('id', id);  // This adds a filter to match only the row with the specified ID
      
        if (error) {
          console.error('Error fetching data:', error);
          return;
        }
      
        // Since we're querying by ID, we can return the first (and only) item in the array
        return data[0] || null;
      }
}
// fetchData();
export default Data;