import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { Mail, Phone, Home, Calendar, Loader2 } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { getMyQueries } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function QueriesPage() {
  const { currentUser, getToken } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQueries() {
      try {
        const token = await getToken();
        const res = await getMyQueries(token);
        setQueries(res.queries || []);
      } catch (err) {
        setError(err.message || 'Failed to load queries');
      } finally {
        setLoading(false);
      }
    }
    fetchQueries();
    document.title = 'My Queries - Property Master';
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <LazyMotion features={domAnimation}>
        <m.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Queries</h1>
            <p className="text-gray-500 mt-2">Manage inquiries received for your properties.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No queries yet</h3>
              <p className="text-gray-500">When someone contacts you about a property, it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {queries.map((q) => (
                <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                    <div>
                      <Link to={`/properties/${q.propertyId}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:underline mb-1">
                        <Home className="w-4 h-4" />
                        {q.propertyTitle}
                      </Link>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(q.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mt-2 mb-4 border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">"{q.message}"</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{q.name}</span>
                    </div>
                    <a href={`mailto:${q.email}`} className="flex items-center gap-2 hover:text-brand-600 transition-colors">
                      <Mail className="w-4 h-4" /> {q.email}
                    </a>
                    {q.phone && (
                      <a href={`tel:${q.phone}`} className="flex items-center gap-2 hover:text-brand-600 transition-colors">
                        <Phone className="w-4 h-4" /> {q.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </m.main>
      </LazyMotion>

      <Footer />
    </div>
  );
}
