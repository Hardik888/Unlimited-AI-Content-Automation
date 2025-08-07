import { bootstrap } from './bootstrap';

const { handlers } = bootstrap();

export const {
    initiateSync,
    processPost
} = handlers;
