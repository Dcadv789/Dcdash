import React from 'react';
import Card from './Card';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <Card>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <div className="h-1 w-24 bg-gray-800 rounded-full"></div>
    </Card>
  );
};

export default PageTitle;