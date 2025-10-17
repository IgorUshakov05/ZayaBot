/**
 * Сравнивает фактический домен запроса с доменом, указанным в query параметре
 * 
 * @param requestDomain - фактический домен с которого делают запрос
 * @param queryDomain - домен который указан query параметром
 * @returns равен ли фактический домен с теоретическим
 */

export const validateDomain = ({
  queryDomain,
  requestDomain,
}: {
  queryDomain: string;
  requestDomain: string;
}) => queryDomain === requestDomain;
