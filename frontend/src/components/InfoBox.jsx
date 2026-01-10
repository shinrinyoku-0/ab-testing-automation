const InfoBox = ({ variant = 'primary', title, items }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      text: 'text-primary'
    },
    secondary: {
      bg: 'bg-secondary-50',
      border: 'border-secondary-200',
      text: 'text-secondary'
    }
  };

  const colors = colorClasses[variant];

  return (
    <div className="flex justify-center">
      <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 m-4`}>
        <p className={`text-xl ${colors.text} font-semibold`}>{title}</p>
        <ul className={`text-medium mt-2 ml-4 list-disc ${colors.text}`}>
          {items.map((item, index) => (
            <li key={index} className="mb-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InfoBox;
