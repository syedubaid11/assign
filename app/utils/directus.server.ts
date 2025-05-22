import { createDirectus,rest,authentication,login } from '@directus/sdk';

export const client = createDirectus('http://128.140.75.83:221').with(authentication('json')).with(rest());