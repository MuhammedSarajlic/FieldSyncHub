import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

export const usePagination = (
  defaultPage: number = 1,
  paramName: string = 'page'
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(
    searchParams.get(paramName) || String(defaultPage),
    10
  );

  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);

      if (page === defaultPage) {
        params.delete(paramName);
      } else {
        params.set(paramName, page.toString());
      }

      const search = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: search ? `?${search}` : '',
        },
        { replace: true }
      );
    },
    [navigate, location.pathname, searchParams, paramName, defaultPage]
  );

  return { currentPage, onPageChange };
};
