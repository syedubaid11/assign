import { useEffect, useState } from "react";
import axios from 'axios';

const directus_url = 'http://128.140.75.83:2221';

interface Feedback {
  id: number;
  title: string;
  description: string;
  category: string;
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [filtered,setFiltered]=useState("");
  
  useEffect(() => {
    const token = localStorage.getItem("directus_token");
    if (token) {
      setIsAuthenticated(true);

      const fetchUserInfo = async () => {
        try {
          const res = await axios.get(`${directus_url}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('User info', res.data);
        } catch (error) {
          console.log('error while fetching user info', error);
        }
      };

      const fetchFeedbacks = async () => {
        try {
          const res = await axios.get(`${directus_url}/items/feedbacks`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFeedback(res.data.data);
        } catch (error) {
          console.error('Error fetching feedbacks:', error);
        }
      };

      const filterFeedbacks = async () => {
        try {
            const userRes = await axios.get(`${directus_url}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            const userId = userRes.data.id;

            const res = await axios.get(
            `${directus_url}/items/feedbacks?filter[user][_eq]=${userId}`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );
            setFiltered(res.data.data);
            console.log(filtered)
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
        };

      filterFeedbacks();
      fetchUserInfo();
      fetchFeedbacks();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const addFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const postFeature = async () => {
      const token = localStorage.getItem('directus_token');
      try {
        const res = await axios.post(`${directus_url}/items/feedbacks`,
          {
            title,
            description,
            category,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res.data);
      } catch (err) {
        console.error('Error posting feature:', err);
      }
    };
    postFeature();
  };

  if (!isAuthenticated) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen w-full p-10 bg-slate-900">
      <form className="max-w-md mx-auto bg-white p-6 rounded shadow mb-8" onSubmit={addFeature}>
        <h2 className="text-xl font-bold mb-4">Add Feedback</h2>
        <input
          className="border p-2 w-full mb-3 bg-slate-200"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-3 bg-slate-200"
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-3 bg-slate-200"
          placeholder="Category"
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Your Feedbacks</h2>
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <div key={item.id} className="border p-4 rounded mb-4 shadow bg-white">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p>{item.description}</p>
              <span className="text-sm text-gray-600">Category: {item.category}</span>
            </div>
          ))
        ) : (
          <p>No feedbacks yet.</p>
        )}
      </div>
    </div>
  );
}
