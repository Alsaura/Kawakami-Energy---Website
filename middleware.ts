import {NextResponse,type NextRequest} from 'next/server';

export function middleware(request:NextRequest){
  const headers=new Headers(request.headers);
  const path=request.nextUrl.pathname;
  const locale=path==='/en'||path.startsWith('/en/')?'en':'id';
  headers.set('x-kawakami-locale',locale);
  const response=NextResponse.next({request:{headers}});
  response.headers.set('Content-Language',locale);
  return response;
}
export const config={matcher:['/((?!images/|_next/|.*\\..*).*)']};
