import { MapPin, Clock, Users, Phone, Mail, Wifi } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Badge from "@/components/ui-lib/Badge";
import { branches } from "@/lib/mock-data";

export default function PublicBranches() {
  return (
    <>
      <PageHeader title="Branches & Hours" subtitle="Find a Fernbridge location near you." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <Card key={b.name}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="f-display text-[17px]" style={{ color: C.ink }}>{b.name}</h3>
                <p className="f-body text-[13px] mt-0.5 flex items-center gap-1.5" style={{ color: C.slateMute }}>
                  <MapPin size={13} /> {b.address}
                </p>
              </div>
              <Badge tone={b.status === "Open" ? "sage" : "brass"}>{b.status}</Badge>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${C.paperLine}` }}>
              <div>
                <span className="f-body text-[11px] uppercase flex items-center gap-1" style={{ color: C.slateMute }}>
                  <Clock size={12} /> Today
                </span>
                <p className="f-body text-[13px]" style={{ color: C.slate }}>{b.hours}</p>
              </div>
              <div>
                <span className="f-body text-[11px] uppercase flex items-center gap-1" style={{ color: C.slateMute }}>
                  <Users size={12} /> Capacity
                </span>
                <p className="f-body text-[13px]" style={{ color: C.slate }}>{b.capacity} seats · {b.staff} staff</p>
              </div>
            </div>

            {/* Full schedule */}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.paperLine}` }}>
              <span className="f-body text-[11px] uppercase" style={{ color: C.slateMute }}>Weekly hours</span>
              <div className="mt-2 space-y-1.5">
                {b.schedule.map((s) => (
                  <div key={s.day} className="flex items-center justify-between">
                    <span className="f-body text-[12.5px]" style={{ color: C.slate }}>{s.day}</span>
                    <span className="f-body text-[12.5px] font-medium" style={{ color: s.hours === "Closed" ? C.stamp : C.slateMute }}>
                      {s.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 pt-4 flex flex-wrap gap-x-5 gap-y-1.5" style={{ borderTop: `1px solid ${C.paperLine}` }}>
              <span className="f-body text-[12.5px] flex items-center gap-1.5" style={{ color: C.slateMute }}>
                <Phone size={12} style={{ color: C.brass }} /> {b.phone}
              </span>
              <span className="f-body text-[12.5px] flex items-center gap-1.5" style={{ color: C.slateMute }}>
                <Mail size={12} style={{ color: C.brass }} /> {b.email}
              </span>
            </div>

            {/* Services */}
            <div className="mt-4 pt-4 flex flex-wrap gap-1.5" style={{ borderTop: `1px solid ${C.paperLine}` }}>
              <span className="f-body text-[11px] uppercase flex items-center gap-1 mr-1" style={{ color: C.slateMute }}>
                <Wifi size={12} /> Offers
              </span>
              {b.services.map((sv) => (
                <Badge key={sv} tone="brass">{sv}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
