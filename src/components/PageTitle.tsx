import React from 'react';
import Card from './Card';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <Card>
      <h1 className="text-2xl font-bold">{title}</h1>
    </Card>
  );
};

export default PageTitle;