import { NextRequest, NextResponse } from "next/server"



const AUTH_COOKIE = "gcore_demo_auth"



function isPublicPath(pathname: string) {

//if (pathname === "/login") return false

if (pathname.startsWith("/_next")) return true

if (pathname.startsWith("/favicon")) return true

if (pathname.startsWith("/icon")) return true

if (pathname.startsWith("/apple-icon")) return true

if (pathname.startsWith("/placeholder")) return true

if (/\.(png|jpg|jpeg|svg|webp|ico|css|js|map)$/.test(pathname)) return true

return false

}



export function proxy(request: NextRequest) {

const { pathname } = request.nextUrl



if (isPublicPath(pathname)) {

return NextResponse.next()

}



const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "1"

if (isAuthed) {

return NextResponse.next()

}



//const loginUrl = request.nextUrl.clone()

//loginUrl.pathname = "/login"

//loginUrl.searchParams.set("next", pathname)

//return NextResponse.redirect(loginUrl)

}

