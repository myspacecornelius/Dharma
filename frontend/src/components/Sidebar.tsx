import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 p-4">
      <h2 className="text-2xl font-bold mb-4">Dharma</h2>
      <nav>
        <ul>
          <li>
            <Link to="/" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Feed
            </Link>
          </li>
          <li>
            <Link to="/heatmap" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Heatmap
            </Link>
          </li>
          <li>
            <Link to="/laces" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Laces
            </Link>
          </li>
          <li>
            <Link to="/dropzones" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Dropzones
            </Link>
          </li>
          <li>
            <Link to="/thriftroutes" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Thrift Routes
            </Link>
          </li>
          <li>
            <Link to="/profile" className="block py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
