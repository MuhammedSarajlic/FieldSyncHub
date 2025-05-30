import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { Plus } from 'lucide-react';
import PricebookItemModal from '../components/Pricebook/PricebookModals/PricebookItemModal';
import ButtonIcon from '../components/CustomElements/ButtonIcon';
import icons from '../constants/icons';
import CustomIconButton from '../components/CustomElements/CustomIconButton';
import Search from '../components/CustomElements/Search';
import PricebookTable from '../components/Pricebook/PricebookTable/PricebookTable';
import {
  GetServiceItems,
  GetServiceItemsByFilter,
} from '../services/ServiceItem';
import { TServiceItem, TServiceItemFilter } from '../types/ServiceItem';
import { useSearchParams } from 'react-router';
import ServiceItemFilterModal from '../components/Pricebook/PricebookModals/ServiceItemFilterModal';
import SortModal from '../components/CustomElements/SortComponent/SortModal';

const Pricebook = () => {
  const [items, setItems] = useState<TServiceItem[]>([]);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSort, setCurrentSort] = useState<string | null>(null);

  const searchQuery = searchParams.get('q') ?? '';
  const sortBy = searchParams.get('sortBy') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)', sortBy: 'name', sort: 'asc' },
    { id: 'name-desc', label: 'Name (Z-A)', sortBy: 'name', sort: 'desc' },
    {
      id: 'price-asc',
      label: 'Price (Low to High)',
      sortBy: 'price',
      sort: 'asc',
    },
    {
      id: 'price-desc',
      label: 'Price (High to Low)',
      sortBy: 'price',
      sort: 'desc',
    },
  ];

  const fetchServiceItems = async () => {
    // Get ALL current search params as an object
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    const hasAnyParam = Object.keys(paramsObj).length > 0;

    if (hasAnyParam) {
      const searchQueryString = new URLSearchParams(paramsObj).toString();
      console.log(searchQueryString);

      const response = await GetServiceItemsByFilter(searchQueryString);
      console.log(response);
      setItems(response.data.payload);
    } else {
      const response = await GetServiceItems();
      setItems(response.data.payload);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (query) {
        newParams.set('q', query);
      } else {
        newParams.delete('q');
      }
      return newParams;
    });
  };

  const handleSort = (optionId: string) => {
    setCurrentSort(optionId);
    const selectedOption = sortOptions.find((opt) => opt.id === optionId);
    if (selectedOption) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('sortBy', selectedOption.sortBy);
        newParams.set('sort', selectedOption.sort);
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('sortBy');
        newParams.delete('sort');
        return newParams;
      });
    }
    setIsSortModalOpen(false);
  };

  const handleApplyFilters = (filters: TServiceItemFilter) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      const flatFilters: Record<string, string | number> = {
        category: filters.category,
        priceMin: filters.price.min,
        priceMax: filters.price.max,
        hoursMin: filters.hours.min,
        hoursMax: filters.hours.max,
        status: filters.status !== 'all' ? filters.status : '',
        images: filters.images !== 'any' ? filters.images : '',
        description: filters.description,
      };

      Object.entries(flatFilters).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value.toString());
        } else {
          newParams.delete(key);
        }
      });

      return newParams;
    });
  };

  useEffect(() => {
    fetchServiceItems();
  }, [searchParams]);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <Navbar />

        <div className='px-4 flex flex-col flex-1'>
          <div className=' flex justify-between items-start'>
            <div>
              <h1 className='text-heading text-4xl font-extrabold'>
                Price Book
              </h1>
              <p className='text-primary'>
                Manage your services, materials, and pricing
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <ButtonIcon name='Import' icon={icons.importIcon} />

              <ButtonIcon name='Export' icon={icons.exportIcon} />
              <div className='w-[1px] h-[38px] bg-border-primary'></div>
              <CustomIconButton
                text={'Add Item'}
                icon={<Plus size={16} className='mr-1.5' />}
                handleClick={() => setIsNewServiceModalOpen(true)}
              />
            </div>
          </div>

          <div className='my-6 flex items-center justify-between'>
            <Search
              inputPlaceholder='Search customers...'
              searchQuery={searchQuery}
              handleChange={handleSearch}
            />
            <div className='flex items-center space-x-3'>
              <SortModal
                setIsSortModalOpen={setIsSortModalOpen}
                isSortModalOpen={isSortModalOpen}
                sortOptions={sortOptions}
                currentSort={currentSort}
                handleSort={handleSort}
              />
              {/* <div className='relative'>
                <ButtonIcon
                  name='Sort'
                  icon={icons.sortIcon}
                  handleBtnClick={() => setIsSortModalOpen(!isSortModalOpen)}
                />
                <ServiceItemSortModal
                  isOpen={isSortModalOpen}
                  onClose={() => setIsSortModalOpen(false)}
                  sortOptions={sortOptions}
                  onSort={handleSort}
                  // currentSort={currentSort}
                />
              </div> */}
              <div className='relative'>
                <ButtonIcon
                  name='Filter'
                  icon={icons.filterIcon}
                  handleBtnClick={() =>
                    setIsFilterModalOpen(!isFilterModalOpen)
                  }
                />
                <ServiceItemFilterModal
                  isOpen={isFilterModalOpen}
                  onClose={() => setIsFilterModalOpen(false)}
                  onApplyFilters={handleApplyFilters}
                />
              </div>
            </div>
          </div>

          <PricebookTable items={items} />
        </div>
      </div>
      {isNewServiceModalOpen && (
        <PricebookItemModal
          onClose={() => setIsNewServiceModalOpen(false)}
          fetchServiceItems={fetchServiceItems}
        />
      )}
    </div>
  );
};

export default Pricebook;
