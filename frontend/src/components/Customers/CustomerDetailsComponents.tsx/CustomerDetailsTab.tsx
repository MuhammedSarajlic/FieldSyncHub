interface ICustomerDetailsTab {
  name: string;
  tabName: string;
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const CustomerDetailsTab = ({
  name,
  tabName,
  selectedTab,
  setSelectedTab,
}: ICustomerDetailsTab) => {
  return (
    <div
      onClick={() => setSelectedTab(tabName)}
      className={`px-2 border-b-4 cursor-pointer ${
        selectedTab === tabName ? 'border-bg-primary' : 'border-transparent'
      }`}
    >
      <p
        className={`py-2 font-semibold ${
          selectedTab === tabName ? 'text-heading' : 'text-heading/70'
        } hover:text-heading`}
      >
        {name}
      </p>
    </div>
  );
};

export default CustomerDetailsTab;
