"use client";

import React, { useEffect, useState } from "react";
import { Carousel } from "@/components/ui/apple-cards-carousel"; // reusing your carousel component
import OrderCard from "./orderCard";
import { TeacherOrderJoinTeacher } from "../types"; // adjust the import based on your project structure
import { getNewTeachers, getAllTeacherImagesAndAboutMes } from "./getPushData";

type Order = {
    teacherOrder :TeacherOrderJoinTeacher;
    imageURL :string;
}
export default function OrderCardsCarouselDemo() {
    const [orders, setOrders] = useState<Order[]>([])
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token') || ''

    useEffect( () => {
        async function fetchOrders() {

            try {
                const orders = await getNewTeachers(BASEURL, token)
                const images = await getAllTeacherImagesAndAboutMes(BASEURL, token)

                //blend them together
                const blendedOrders: Order[] = orders.map((order: TeacherOrderJoinTeacher) => {
                    const foundImage = images.find(
                      (img) => img.user_id === order.teacher.user_id
                    );
              
                    return {
                      teacherOrder: order,
                      imageURL: foundImage ? foundImage.image : "/placeholder-image.webp", // Provide a default value if no image is found.
                      handleDelete: deleteOrder
                    };
                });

                //filter them by date
                blendedOrders.sort((a, b) => {
                    return new Date(b.teacherOrder.order.created_at).getTime() - new Date(a.teacherOrder.order.created_at).getTime();
                });
                
                setOrders(blendedOrders)
            }
            catch (error) {
                alert(`Klarte ikke å hente inn dine nye bestillinger ${error}`)
            }
        }
        fetchOrders()
    },[])

    //pass this fucntion to every card
    const deleteOrder = (rowId: string) => {
      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order.teacherOrder.order.row_id !== rowId
        )
      );
    };

    const cards = orders
      .map((order: Order) => {
        if (order.teacherOrder.order.hidden) {
          return null;
        }
        return <OrderCard key={order.teacherOrder.order.row_id} order={order} handleUIDelete={deleteOrder}/>;
      })
      .filter((card): card is JSX.Element => card !== null);

      return (
        <div className="w-full">
          <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
            Dine bestillinger
          </h2>
          <Carousel items={cards} handleDelete={deleteOrder}/>
        </div>
      );
}