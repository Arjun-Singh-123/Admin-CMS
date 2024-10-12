"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Ship, Anchor } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Vessel {
  vesselName: string;
  length: string;
  halfDay: string;
  weekday: string;
  weekend: string;
}

interface Rental {
  id: string;
  members: Vessel[];
  non_members: Vessel[];
}

export default function ManageRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [newMember, setNewMember] = useState<Vessel>({
    vesselName: "",
    length: "",
    halfDay: "",
    weekday: "",
    weekend: "",
  });
  const [newNonMember, setNewNonMember] = useState<Vessel>({
    vesselName: "",
    length: "",
    halfDay: "",
    weekday: "",
    weekend: "",
  });

  useEffect(() => {
    const fetchRentals = async () => {
      const { data, error } = await supabase.from("rentals").select("*");
      if (error) console.error("Error fetching rentals:", error);
      else setRentals(data as any);
    };
    fetchRentals();
  }, []);

  const handleAddMember = async () => {
    // Check if any field is empty
    if (Object.values(newMember).some((value) => !value)) {
      toast.warning("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("rentals")
      .update({
        members: [...rentals[0]?.members, newMember],
      })
      .eq("id", rentals[0]?.id)
      .select("*");

    if (error) console.error("Error updating members:", error);
    else setRentals(data || []);

    // Reset form
    setNewMember({
      vesselName: "",
      length: "",
      halfDay: "",
      weekday: "",
      weekend: "",
    });
  };

  const handleAddNonMember = async () => {
    if (Object.values(newNonMember).some((value) => !value)) {
      toast.warning("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("rentals")
      .update({
        non_members: [...rentals[0]?.non_members, newNonMember],
      })
      .eq("id", rentals[0]?.id)
      .select("*");

    if (error) console.error("Error updating non-members:", error);
    else setRentals(data || []);

    // Reset form
    setNewNonMember({
      vesselName: "",
      length: "",
      halfDay: "",
      weekday: "",
      weekend: "",
    });
  };

  const RentalForm = ({
    type,
    state,
    setState,
    handleAdd,
  }: {
    type: string;
    state: Vessel;
    setState: React.Dispatch<React.SetStateAction<Vessel>>;
    handleAdd: () => Promise<void>;
  }) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${type}VesselName`}>Vessel Name</Label>
        <Input
          id={`${type}VesselName`}
          value={state.vesselName}
          onChange={(e) => setState({ ...state, vesselName: e.target.value })}
          placeholder="Enter vessel name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${type}Length`}>Length</Label>
          <Input
            id={`${type}Length`}
            value={state.length}
            onChange={(e) => setState({ ...state, length: e.target.value })}
            placeholder="Length in feet"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${type}HalfDay`}>Half Day Rate</Label>
          <Input
            id={`${type}HalfDay`}
            value={state.halfDay}
            onChange={(e) => setState({ ...state, halfDay: e.target.value })}
            placeholder="$"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${type}Weekday`}>Weekday Rate</Label>
          <Input
            id={`${type}Weekday`}
            value={state.weekday}
            onChange={(e) => setState({ ...state, weekday: e.target.value })}
            placeholder="$"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${type}Weekend`}>Weekend Rate</Label>
          <Input
            id={`${type}Weekend`}
            value={state.weekend}
            onChange={(e) => setState({ ...state, weekend: e.target.value })}
            placeholder="$"
          />
        </div>
      </div>
      <Button onClick={handleAdd} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add {type}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center space-x-2 mb-6">
        <Anchor className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Rental Management</h1>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="nonMembers">Non-Members</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Member Rental</CardTitle>
              <CardDescription>Add a new rental for members</CardDescription>
            </CardHeader>
            <CardContent>
              <RentalForm
                type="Member"
                state={newMember}
                setState={setNewMember}
                handleAdd={handleAddMember}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {rentals.map((rental) => (
              <Card key={rental.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ship className="mr-2 h-5 w-5" />
                    Rental ID: {rental.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Members:</h4>
                  <div className="grid gap-4">
                    {rental.members &&
                      rental.members.map((member, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Vessel Name</p>
                              <p className="text-sm text-gray-500">
                                {member.vesselName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Length</p>
                              <p className="text-sm text-gray-500">
                                {member.length} feet
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Half Day</p>
                              <p className="text-sm text-gray-500">
                                ${member.halfDay}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Weekday</p>
                              <p className="text-sm text-gray-500">
                                ${member.weekday}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Weekend</p>
                              <p className="text-sm text-gray-500">
                                ${member.weekend}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nonMembers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Non-Member Rental</CardTitle>
              <CardDescription>
                Add a new rental for non-members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RentalForm
                type="Non-Member"
                state={newNonMember}
                setState={setNewNonMember}
                handleAdd={handleAddNonMember}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {rentals.map((rental) => (
              <Card key={rental.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ship className="mr-2 h-5 w-5" />
                    Rental ID: {rental.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Non-Members:</h4>
                  <div className="grid gap-4">
                    {rental.non_members &&
                      rental.non_members.map((nonMember, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Vessel Name</p>
                              <p className="text-sm text-gray-500">
                                {nonMember.vesselName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Length</p>
                              <p className="text-sm text-gray-500">
                                {nonMember.length} feet
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Half Day</p>
                              <p className="text-sm text-gray-500">
                                ${nonMember.halfDay}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Weekday</p>
                              <p className="text-sm text-gray-500">
                                ${nonMember.weekday}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Weekend</p>
                              <p className="text-sm text-gray-500">
                                ${nonMember.weekend}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
