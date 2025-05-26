import { useSearchParams } from 'react-router';

interface IUseClearFilters {
  clearFilterURLParams: (filterOptionsArray: any[]) => void;
}

const useClearFilters = (): IUseClearFilters => {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearFilterURLParams = (filterOptionsArray: any[]) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      filterOptionsArray.forEach((option) => {
        if (option.type === 'range' && option.name) {
          newParams.delete(`${option.name}Min`);
          newParams.delete(`${option.name}Max`);
        } else {
          newParams.delete(option.name);
        }
      });
      newParams.delete('q');
      return newParams;
    });
  };

  return { clearFilterURLParams };
};

export default useClearFilters;
