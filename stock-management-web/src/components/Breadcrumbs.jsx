import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

// items: [{ label, to? }] - the last item (current page) should omit `to`.
const Breadcrumbs = ({ items = [] }) => (
  <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <FaChevronRight className="w-3 h-3 text-gray-400" />}
        {item.to ? (
          <Link to={item.to} className="hover:text-blue-600 hover:underline">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-700 font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;
