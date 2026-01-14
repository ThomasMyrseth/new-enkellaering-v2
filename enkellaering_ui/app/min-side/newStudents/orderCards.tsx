"use client";

import React, { useEffect, useState } from "react";
import { Carousel } from "@/components/ui/apple-cards-carousel"; // reusing your carousel component
import OrderCard from "./orderCard";
import { getNewTeachers } from "./getPushData";
import { TeacherOrderJoinTeacher } from "../types";
import { toast } from "sonner";


export default function OrderCardsCarouselDemo() {
    const [orders, setOrders] = useState<TeacherOrderJoinTeacher[]>([])
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token') || ''

    useEffect( () => {
        async function fetchOrders() {

            try {
                const o = await getNewTeachers(BASEURL, token)
                
                //filter them by date
                o.sort((a, b) => {
                    return new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime();
                });
                
                setOrders(o)
            }
            catch (error) {
                toast.error(`Klarte ikke å hente inn dine nye bestillinger ${error}`)
            }
        }
        fetchOrders()
    },[BASEURL, token])

    //pass this fucntion to every card
    const deleteOrder = (rowId: string) => {
      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order.order.row_id !== rowId
        )
      );
    };

    const cards = orders
      .map((order: TeacherOrderJoinTeacher) => {
        if (order.order.hidden) {
          return null;
        }
        return <OrderCard key={order.order.row_id} order={order} handleUIDelete={deleteOrder}/>;
      })
      .filter((card): card is JSX.Element => card !== null);

      return (
        <div className="w-full">
          {cards.length>0 &&
            <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
              Dine bestillinger
            </h2>
          }
          {cards.length===0 &&
            <h3 className="text-center mx-auto text-lg md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
              Du har ikke bestilt noen nye lærere
            </h3>
          }
          <Carousel items={cards} handleDelete={deleteOrder}/>
        </div>
      );
}