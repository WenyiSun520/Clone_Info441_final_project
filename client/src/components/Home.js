import React from 'react';
import { auth } from '../firebase';
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import TypeAccordion from "./TypeAccordion";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";


const Home = ({ user }) => {

    const [cost, setCost] = useState({
        recon: [],
        infantry: [],
        tank: [],
        support: [],
        "anti-tank": [],
        "anti-air": [],
        artillery: [],
        defense: [],
    });
    const [rules, setRules] = useState({
        recon: [],
        infantry: [],
        tank: [],
        support: [],
        "anti-tank": [],
        "anti-air": [],
        artillery: [],
        defense: [],
    });

    const [deck, setDeck] = useState({
        recon: [],
        infantry: [],
        tank: [],
        support: [],
        "anti-tank": [],
        "anti-air": [],
        artillery: [],
        defense: [],
    });

    const onChange = (key, value) => {
        deck[key] = value;
        setDeck({ ...deck });
    };

    const onClick = (e) => {
        // post deck
        console.log(deck);
    };

    useEffect(() => {
        const division = "CAN_3CID_Dv2";
        fetch(
            `http://localhost:3000/api/v1/getCostMatrix?division_name=${division}`
        )
            .then((res) => res.json())
            .then((result) => {
                setCost(result);

                Object.entries(result).forEach(([key, value]) => {
                    deck[key] = Array(value.length).fill("");
                });
                setDeck({ ...deck });
            });

        fetch(
            `http://localhost:3000/api/v1/getDivisionUnitRuleUnit?division_name=${division}`
        )
            .then((res) => res.json())
            .then((result) => {
                for (let type in result) {
                    rules[type] = result[type];
                }
                setRules({ ...rules });
            });
    }, []);

    return (
        <div className="home">
            <h1>Hello, <span></span>{user.displayName}</h1>
            <img src={user.photoURL} alt="" />
            <button className="button signout" onClick={() => auth.signOut()}>Sign out</button>

            <main>
                <Container>
                    <Accordion>
                        {Object.keys(cost).map((type, i) => (
                            <Accordion.Item eventKey={i}>
                                <Accordion.Header>{type}</Accordion.Header>
                                <Accordion.Body>
                                    {cost[type].map((u, j) => (
                                        <TypeAccordion
                                            cost={u}
                                            units={rules[type]}
                                            type={type}
                                            ord={j}
                                            deck={deck}
                                            onChange={onChange}
                                        />
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    <div className="d-grid gap-2">
                        <Button variant="primary" size="lg" onClick={onClick}>
                            Save
                        </Button>
                    </div>
                </Container>
            </main>

        </div>
    )
}

export default Home;